"""
SolForge Multi-Lane Orchestrator
Integrates Paper Trading, AI, Jupiter, and Persistence into a unified system.
"""
import asyncio
import logging
import time
from typing import Dict, List, Optional
from decimal import Decimal
from datetime import datetime

import os
from .paper_trader import PaperTradingEngine
from .models import (
    RiskProfile, LaneStatus, TradeAction, TradeStatus, MarketData, Trade
)
from .database import (
    get_db, LaneRepository, TradeRepository, init_db, SessionLocal
)
from .risk_profiles import get_profile_config
from ..integrations.jupiter import JupiterClient
from ..ai.ppo_agent import PPOAgent
from ..ai.features import FeatureEngineer
from ..ai.trainer import AITrainer
from ..integrations.jito import JitoClient
from .arbitrage import ArbitrageScout
from .risk_manager import RiskManager
from .token_list import ARB_TARGETS
from ..integrations.raydium import RaydiumClient
from .route_selector import RouteSelector
from .readiness import ReadinessScorer

logger = logging.getLogger(__name__)

class MultiLaneOrchestrator:
    def __init__(self, config: Dict = {}):
        self.config = config

        # Load environment variables for live trading
        private_key = os.getenv("SOLANA_PRIVATE_KEY") or config.get("solana_private_key")
        rpc_url = os.getenv("SOLANA_RPC_URL") or config.get("solana_rpc_url", "https://api.mainnet-beta.solana.com")

        # Jito & Arbitrage
        self.jito_client = JitoClient(mock_mode=config.get("mock_mode", True))

        # Components
        self.paper_engine = PaperTradingEngine(config)
        self.jupiter_client = JupiterClient(
            mock_mode=config.get("mock_mode", False),
            private_key=private_key,
            rpc_url=rpc_url,
            jito_client=self.jito_client
        )

        # State
        self.is_running = False
        self.trainers: Dict[str, AITrainer] = {} # lane_id -> Trainer
        self.market_history: Dict[str, List[MarketData]] = {} # mint -> history

        # Database
        init_db()
        self.db = SessionLocal()
        self.lane_repo = LaneRepository(self.db)
        self.trade_repo = TradeRepository(self.db)

        self.arb_scout = ArbitrageScout(self.jupiter_client, self.jito_client)
        self.risk_manager = RiskManager(config.get("risk_manager", {}))
        self.raydium_client = RaydiumClient(
            rpc_url,
            mock_mode=config.get("mock_mode", False),
            jito_client=self.jito_client
        )

        # Route Selector for intelligent DEX routing
        self.route_selector = RouteSelector(
            jupiter_client=self.jupiter_client,
            raydium_client=self.raydium_client,
            config=config.get("route_selector", {})
        )

        # Readiness Scorer for live trading graduation
        self.readiness_scorer = ReadinessScorer(
            config=config.get("readiness_scorer", {})
        )
        
    def initialize(self):
        """Initialize system state"""
        logger.info("Initializing Orchestrator...")
        
        # 1. Load or Create Lanes
        existing_lanes = self.lane_repo.list_lanes()
        
        if not existing_lanes:
            logger.info("No lanes found in DB. Creating default lanes.")
            self._create_default_lanes()
        else:
            logger.info(f"Loaded {len(existing_lanes)} lanes from DB.")
            for lane_state in existing_lanes:
                # Reconstruct TradingLane objects
                profile_config = get_profile_config(lane_state.profile)
                lane = self.paper_engine.create_lane(
                    name=lane_state.name,
                    profile=lane_state.profile,
                    initial_capital=lane_state.initial_capital,
                    profile_config=profile_config.to_dict()
                )
                # Restore state override (since create_lane makes fresh)
                lane.id = lane_state.id # IMPORTANT: Restore ID
                lane.current_capital = lane_state.current_capital
                lane.total_pnl = lane_state.total_pnl
                lane.total_trades = lane_state.total_trades
                # ... restore other stats if needed
                
                # Register in engine with correct ID
                self.paper_engine._lanes[lane.id] = lane
                
        # 2. Initialize AI for each lane
        for lane in self.paper_engine.get_all_lanes():
            self._setup_ai(lane.id)
            
        logger.info("Initialization complete.")

    def _create_default_lanes(self):
        """Create the standard Safe, Moderate, YOLO lanes"""
        defaults = [
            ("Alpha Safe", RiskProfile.SAFE, Decimal("20.0")),
            ("Beta Mod", RiskProfile.MODERATE, Decimal("20.0")),
            ("Gamma YOLO", RiskProfile.YOLO, Decimal("20.0"))
        ]
        
        for name, profile, cap in defaults:
            # Create in Engine
            profile_cfg = get_profile_config(profile)
            lane = self.paper_engine.create_lane(
                name=name,
                profile=profile,
                initial_capital=cap,
                profile_config=profile_cfg.to_dict()
            )
            
            # Save to DB
            self.lane_repo.save_lane(lane.get_state())

    def _setup_ai(self, lane_id: str):
        """Setup Trainer, Agent, and Feature Engineer for a lane"""
        # Load agent if exists (pickle - but PPO uses torch.save which creates .pth or similar usually. 
        # But PPOAgent.save method uses torch.save. File extension can stay .pkl or change to .pth.
        # Let's use .pth to distinguish.)
        
        agent_file = f"data/agent_{lane_id}.pth"
        
        # Initialize PPO Agent
        # input_dim=8 matches FeatureVectorizer
        agent = PPOAgent(input_dim=8, action_dim=3, lr=0.002) 
        
        try:
            agent.load(agent_file)
            logger.info(f"Loaded PPO agent for {lane_id}")
        except Exception:
            logger.info(f"Created new PPO agent for {lane_id}")
            
        fe = FeatureEngineer()
        trainer = AITrainer(agent, fe)
        self.trainers[lane_id] = trainer

    async def run_loop(self, interval_seconds: int = 60):
        """Main execution loop"""
        self.is_running = True
        self.paper_engine.start()
        
        logger.info(f"Starting loop (interval: {interval_seconds}s)...")
        
        try:
            while self.is_running:
                start_time = time.time()
                
                await self.tick()
                
                # Save State
                self._persist_state()
                
                # Sleep remainder
                elapsed = time.time() - start_time
                sleep_time = max(0, interval_seconds - elapsed)
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
                    
        except asyncio.CancelledError:
            logger.info("Loop cancelled")
        finally:
            self.shutdown()

    async def tick(self):
        """One processing cycle"""
        logger.info("--- Tick ---")
        
        # 1. Update Market Data for all interested tokens
        # For now, let's just track SOL and USDC for simplicity
        # In real app, we'd look at each lane's 'allowed_tokens'
        monitored_tokens = ["So11111111111111111111111111111111111111112"] # SOL
        
        prices = await self.jupiter_client.get_prices(monitored_tokens)
        
        # Create MarketData objects
        current_data_map = {}
        for mint, price in prices.items():
            md = MarketData(
                mint=mint,
                symbol="SOL", # Simplified
                price_usd=price,
                volume_24h=Decimal("0"), # API doesn't return vol in simple price
                liquidity_usd=Decimal("0"),
                timestamp=datetime.utcnow(),
                price_change_1h=0.0,
                price_change_24h=0.0
            )
            
            if mint not in self.market_history:
                self.market_history[mint] = []
            self.market_history[mint].append(md)
            
            # Keep history manageable
            if len(self.market_history[mint]) > 100:
                self.market_history[mint].pop(0)
                
            current_data_map[mint] = md
            
        # 2. Process Lanes (Parallelized for Performance)
        active_lanes = [l for l in self.paper_engine.get_all_lanes() if l.status == LaneStatus.ACTIVE]
        
        if active_lanes:
            tasks = [self._process_lane(lane, current_data_map) for lane in active_lanes]
            await asyncio.gather(*tasks)
            
        # 3. Arbitrage Scouting
        if self.config.get("arb_scout_enabled", True):
            await self._scout_arbitrage()

    async def _scout_arbitrage(self):
        """Scan for price discrepancies across the token portfolio"""
        targets = ARB_TARGETS
        
        opportunities = await self.arb_scout.find_cyclic_opportunity(targets)
        for opp in opportunities:
            logger.info(f"Scout found delta: {opp['profit_pct']:.2%}")
            
            # Execute if threshold met and real execution is allowed
            exec_threshold = self.config.get("arb_exec_threshold_pct", 1.0)
            if opp['profit_pct'] >= exec_threshold:
                private_key = os.getenv("SOLANA_PRIVATE_KEY") or self.config.get("solana_private_key")
                if private_key:
                    logger.info(f"Triggering Arb Execution for {opp['path'][1][:8]}...")
                    bundle_id = await self.arb_scout.execute_arb_bundle(
                        opportunity=opp,
                        private_key=private_key,
                        rpc_url=self.jupiter_client.rpc_url
                    )
                    if bundle_id:
                        logger.info(f"Arb bundle executed: {bundle_id}")
                else:
                    logger.warning("Arb opportunity found but no SOLANA_PRIVATE_KEY configured for execution.")
            
    async def _process_lane(self, lane, current_data_map):
        """Process decisions for a single lane"""
        trainer = self.trainers.get(lane.id)
        if not trainer: return
        
        # Determine target token (Simplified: All trade SOL/USDC)
        target_mint = "So11111111111111111111111111111111111111112"
        history = self.market_history.get(target_mint, [])
        
        if not history: return
        
        sol_balance = lane.wallet.get_balance(target_mint)
        is_holding = sol_balance > Decimal("0.01")
        
        # 1. Check for Stop-Loss / Take-Profit (Hard Exit)
        if is_holding:
            current_price = history[-1].price_usd
            # Find the BUY trade that opened this position
            last_buy = next((t for t in reversed(lane.trades) if t.action == TradeAction.BUY and t.status == TradeStatus.EXECUTED), None)
            
            if last_buy:
                entry_price = last_buy.price_at_entry
                price_diff_pct = float((current_price - entry_price) / entry_price)
                
                sl_pct = lane.profile_config.get("stop_loss_pct", 0.05)
                tp_pct = lane.profile_config.get("take_profit_pct", 0.10)
                
                exit_reason = None
                if price_diff_pct <= -sl_pct:
                    exit_reason = f"STOP LOSS HIT ({price_diff_pct:.2%})"
                elif price_diff_pct >= tp_pct:
                    exit_reason = f"TAKE PROFIT HIT ({price_diff_pct:.2%})"
                
                if exit_reason:
                    logger.warning(f"Lane {lane.id}: {exit_reason}. Triggering Emergency Sell.")
                    await self._execute_sell(lane, target_mint, sol_balance, history, reason=exit_reason)
                    return # Skip AI decision if we already exited via SL/TP
        
        # 2. Get AI Decision
        action = trainer.get_decision(history, current_holdings=is_holding)
        
        if action == TradeAction.HOLD:
            # Calculate reward for holding (if price moved)
            # Need previous price... for MVP skip complex hold reward
            pass
            
        elif action == TradeAction.BUY and not is_holding:
            # Try to BUY
            # Amount: Use dynamic risk manager
            # For MVP simplicity, we use lane capital and mock stats (win_rate, vol)
            # In production, these should come from real performance tracking
            amount_in_usdc = self.risk_manager.calculate_position_size(
                available_capital=lane.current_capital,
                win_rate=lane.win_rate or 0.5,
                avg_win_pct=0.05,
                avg_loss_pct=0.03,
                current_volatility=1.0, # Placeholder
                max_profile_pct=lane.profile_config.get("max_position_pct", 0.25)
            )

            if amount_in_usdc <= 0:
                logger.info(f"RiskManager blocked BUY for {lane.name}: Size too small or risk high.")
                return
            
            # Get Quote: USDC -> SOL (Use Route Selector)
            try:
                usdc_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

                # Intelligent route selection
                use_route_selector = self.config.get("use_route_selector", True)

                if use_route_selector:
                    route_type, quote_data = await self.route_selector.select_best_route(
                        input_mint=usdc_mint,
                        output_mint=target_mint,
                        amount=amount_in_usdc
                    )
                    logger.info(f"Selected {route_type.upper()} route for BUY")

                    # Convert Raydium dict quote to PriceQuote if needed
                    if isinstance(quote_data, dict):
                        from ..core.models import PriceQuote
                        quote = PriceQuote(
                            input_mint=quote_data["input_mint"],
                            output_mint=quote_data["output_mint"],
                            input_amount=quote_data["input_amount"],
                            output_amount=quote_data["output_amount"],
                            price=quote_data["output_amount"] / quote_data["input_amount"],
                            price_impact_pct=quote_data.get("price_impact", 0.0),
                            slippage_bps=quote_data.get("slippage_bps", 50),
                            route=[{"route": quote_data.get("route", "raydium_direct")}],
                            metadata={"route_type": route_type, "raydium_data": quote_data}
                        )
                    else:
                        quote = quote_data
                        quote.metadata = quote.metadata or {}
                        quote.metadata["route_type"] = route_type
                else:
                    # Legacy: Jupiter only
                    quote = await self.jupiter_client.get_quote(
                        input_mint=usdc_mint,
                        output_mint=target_mint,
                        amount=amount_in_usdc
                    )
                    quote.metadata = quote.metadata or {}
                    quote.metadata["route_type"] = "jupiter"

                # Execute
                trade = self.paper_engine.execute_trade_signal(
                    lane_id=lane.id,
                    action=TradeAction.BUY,
                    token_mint=target_mint,
                    quote=quote
                )

                # Real Execution if not in mock mode
                if not self.jupiter_client.mock_mode and trade:
                    try:
                        route_type = quote.metadata.get("route_type", "jupiter")

                        if route_type == "raydium":
                            logger.info(f"Executing via Raydium Direct for {lane.name}")
                            # For now, fall back to Jupiter since Raydium SDK integration is pending
                            # In future, call: self.raydium_client.execute_direct_swap(...)
                            logger.warning("Raydium execution pending SDK integration, using Jupiter")
                            sig = await self.jupiter_client.execute_swap(quote)
                        else:
                            sig = await self.jupiter_client.execute_swap(quote)

                        trade.metadata["signature"] = sig
                        trade.metadata["route"] = route_type
                        logger.info(f"LIVE BUY SUCCESS ({route_type}): {sig}")
                    except Exception as e:
                        logger.error(f"LIVE BUY FAILED for {lane.name}: {e}")
                        trade.status = TradeStatus.FAILED
                        trade.metadata["error"] = str(e)
                        self.trade_repo.save_trade(trade)
                        return # Stop processing this lane for this tick

                if trade:
                    self.trade_repo.save_trade(trade)

                # Reward is delayed until SELL? Or immediate?
                # For Q-learning, we usually reward transitions.
                # Immediate reward = -transaction cost.
                trainer.update(-0.01, history) # Small penalty for trading
                
            except Exception as e:
                logger.error(f"Buy failed for {lane.name}: {e}")
                
        elif action == TradeAction.SELL and is_holding:
            await self._execute_sell(lane, target_mint, sol_balance, history)

    async def _execute_sell(self, lane, target_mint, sol_balance, history, reason=None):
        """Helper to execute a sell trade (AI or SL/TP triggered)"""
        trainer = self.trainers.get(lane.id)
        try:
            usdc_mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

            # Intelligent route selection
            use_route_selector = self.config.get("use_route_selector", True)

            if use_route_selector:
                route_type, quote_data = await self.route_selector.select_best_route(
                    input_mint=target_mint,
                    output_mint=usdc_mint,
                    amount=sol_balance
                )
                logger.info(f"Selected {route_type.upper()} route for SELL")

                # Convert Raydium dict quote to PriceQuote if needed
                if isinstance(quote_data, dict):
                    from ..core.models import PriceQuote
                    quote = PriceQuote(
                        input_mint=quote_data["input_mint"],
                        output_mint=quote_data["output_mint"],
                        input_amount=quote_data["input_amount"],
                        output_amount=quote_data["output_amount"],
                        price=quote_data["output_amount"] / quote_data["input_amount"],
                        price_impact_pct=quote_data.get("price_impact", 0.0),
                        slippage_bps=quote_data.get("slippage_bps", 50),
                        route=[{"route": quote_data.get("route", "raydium_direct")}],
                        metadata={"route_type": route_type, "raydium_data": quote_data}
                    )
                else:
                    quote = quote_data
                    quote.metadata = quote.metadata or {}
                    quote.metadata["route_type"] = route_type
            else:
                # Legacy: Jupiter only
                quote = await self.jupiter_client.get_quote(
                    input_mint=target_mint,
                    output_mint=usdc_mint,
                    amount=sol_balance
                )
                quote.metadata = quote.metadata or {}
                quote.metadata["route_type"] = "jupiter"

            # Execute
            trade = self.paper_engine.execute_trade_signal(
                lane_id=lane.id,
                action=TradeAction.SELL,
                token_mint=target_mint,
                quote=quote
            )

            if reason and trade:
                trade.ai_reasoning = reason # Overwrite with SL/TP reason

            # Real Execution if not in mock mode
            if not self.jupiter_client.mock_mode and trade:
                try:
                    route_type = quote.metadata.get("route_type", "jupiter")

                    if route_type == "raydium":
                        logger.info(f"Executing via Raydium Direct for {lane.name}")
                        # For now, fall back to Jupiter since Raydium SDK integration is pending
                        logger.warning("Raydium execution pending SDK integration, using Jupiter")
                        sig = await self.jupiter_client.execute_swap(quote)
                    else:
                        sig = await self.jupiter_client.execute_swap(quote)

                    trade.metadata["signature"] = sig
                    trade.metadata["route"] = route_type
                    logger.info(f"LIVE SELL SUCCESS ({route_type}): {sig}")
                except Exception as e:
                    logger.error(f"LIVE SELL FAILED for {lane.name}: {e}")
                    trade.status = TradeStatus.FAILED
                    trade.metadata["error"] = str(e)
                    self.trade_repo.save_trade(trade)
                    return

            if trade:
                # Update lane stats (Calculates PnL)
                # Find the BUY trade that opened this
                last_buy = next((t for t in reversed(lane.trades[:-1]) if t.action == TradeAction.BUY and t.status == TradeStatus.EXECUTED), None)
                if last_buy:
                    lane.close_position(last_buy, quote.price, quote.output_amount)
                    # The close_position method updates the original trade's PnL
                    # We should copy that info or verify the trade repo gets it.
                    trade.pnl = last_buy.pnl
                    trade.pnl_pct = last_buy.pnl_pct
                
                self.trade_repo.save_trade(trade)
                
                # Reward based on PnL
                reward = 1.0 if (trade.pnl and trade.pnl > 0) else -1.0
                if trainer:
                    trainer.update(reward, history)
            
        except Exception as e:
            logger.error(f"Sell failed for {lane.name}: {e}")

    def _persist_state(self):
        """Save all state to DB"""
        for lane in self.paper_engine.get_all_lanes():
            # Save Lane State
            self.lane_repo.save_lane(lane.get_state())
            
            # Save Agent State
            trainer = self.trainers.get(lane.id)
            if trainer:
                trainer.agent.save(f"data/agent_{lane.id}.pth")
                
            # Save New Trades
            # Trades are now saved immediately upon execution in _process_lane
            # to avoid N+1 select loop performance hit.
            # Only lane state and agent weights are persisted here.
                
        logger.debug("State persisted")

    def shutdown(self):
        self.is_running = False
        self.paper_engine.stop()
        self.db.close()
        logger.info("Orchestrator shutdown")
