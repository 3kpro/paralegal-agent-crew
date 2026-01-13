"""
SolForge Main Entry Point
Runs the trading bot in paper or live mode
"""
import asyncio
import argparse
import signal
import sys
from pathlib import Path
from datetime import datetime
from decimal import Decimal
import yaml
import logging
from logging.handlers import RotatingFileHandler

from rich.console import Console
from rich.logging import RichHandler

from .lane import TradingLane
from .models import RiskProfile, LaneStatus
from .guardrails import Guardrails
from ..integrations.jupiter import get_jupiter_client, cleanup_jupiter
from ..ai.q_learning import QLearningAgent
from ..ai.features import FeatureExtractor

console = Console()
logger = logging.getLogger("solforge")


def setup_logging(log_level: str = "INFO"):
    """Configure logging with rich output"""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(message)s",
        datefmt="[%X]",
        handlers=[
            RichHandler(rich_tracebacks=True, console=console),
            RotatingFileHandler(
                "solforge.log",
                maxBytes=10_000_000,
                backupCount=5
            )
        ]
    )


def load_config(config_path: str = "config/config.yaml") -> dict:
    """Load configuration from YAML file"""
    path = Path(config_path)
    if not path.exists():
        console.print(f"[red]Config file not found: {config_path}[/red]")
        console.print("[yellow]Copy config/config.example.yaml to config/config.yaml[/yellow]")
        sys.exit(1)
    
    with open(path) as f:
        return yaml.safe_load(f)


class SolForgeEngine:
    """
    Main trading engine orchestrating multiple lanes.
    """
    
    def __init__(self, config: dict):
        self.config = config
        self.mode = config["app"]["mode"]  # paper or live
        
        # Initialize guardrails
        self.guardrails = Guardrails(config["guardrails"])
        
        # Initialize lanes
        self.lanes: dict[str, TradingLane] = {}
        self._init_lanes()
        
        # Initialize Jupiter client
        self.jupiter = get_jupiter_client()
        
        # Feature extractors per token
        self.feature_extractors: dict[str, FeatureExtractor] = {}
        
        # Control flags
        self.running = False
        self.shutdown_event = asyncio.Event()
    
    def _init_lanes(self):
        """Initialize trading lanes from config"""
        lanes_config = self.config.get("lanes", {})
        risk_profiles = self.config.get("risk_profiles", {})
        
        initial_capital = Decimal(str(lanes_config.get("initial_capital", 20)))
        
        for lane_key, lane_cfg in lanes_config.items():
            if lane_key == "initial_capital":
                continue
            if not lane_cfg.get("enabled", True):
                continue
            
            name = lane_cfg.get("name", lane_key)
            profile_name = lane_cfg.get("profile", "moderate")
            profile = RiskProfile(profile_name)
            profile_config = risk_profiles.get(profile_name, {})
            
            lane = TradingLane(
                name=name,
                profile=profile,
                initial_capital=initial_capital,
                profile_config=profile_config,
                guardrails=self.guardrails,
                lane_id=lane_key
            )
            
            # Initialize AI agent for this lane
            lane.ai_model = QLearningAgent(
                lane_id=lane_key,
                learning_rate=profile_config.get("learning_rate", 0.001),
                checkpoint_dir=self.config["ai"].get("checkpoint_dir", "./checkpoints")
            )
            
            # Try to load existing model
            lane.ai_model.load()
            
            self.lanes[lane_key] = lane
            
            console.print(f"[green]✓[/green] Lane '{name}' ({profile_name}) initialized")
    
    def _get_feature_extractor(self, token: str) -> FeatureExtractor:
        """Get or create feature extractor for token"""
        if token not in self.feature_extractors:
            self.feature_extractors[token] = FeatureExtractor(
                lookback_window=self.config["ai"].get("lookback_window", 50)
            )
        return self.feature_extractors[token]
    
    async def _update_prices(self):
        """Fetch latest prices and update feature extractors"""
        # Get prices for common tokens
        tokens = self.config.get("tokens", {})
        mints = list(tokens.values())
        
        try:
            prices = await self.jupiter.get_prices(mints)
            
            for mint, price in prices.items():
                extractor = self._get_feature_extractor(mint)
                # Volume would come from a data feed - using 1.0 as placeholder
                extractor.update(float(price), 1.0)
                
        except Exception as e:
            logger.error(f"Price update failed: {e}")
    
    async def _trading_loop(self, lane: TradingLane):
        """Main trading loop for a single lane"""
        sol_mint = self.config["tokens"]["SOL"]
        usdc_mint = self.config["tokens"]["USDC"]
        
        while self.running and lane.status == LaneStatus.ACTIVE:
            try:
                # Update cooldown status
                lane.update_cooldown_status()
                
                if lane.status != LaneStatus.ACTIVE:
                    await asyncio.sleep(5)
                    continue
                
                # Get current features
                extractor = self._get_feature_extractor(sol_mint)
                features = extractor.get_features(
                    current_position_pct=float(lane.current_capital / lane.initial_capital) - 1,
                    recent_pnl_pct=lane.total_pnl_pct
                )
                
                # Get AI decision
                decision = lane.ai_model.decide(features)
                
                logger.debug(
                    f"Lane {lane.id}: AI suggests {decision.action.value} "
                    f"(confidence: {decision.confidence:.2f})"
                )
                
                # Check guardrails and execute if allowed
                if decision.action != decision.action.HOLD:
                    position_value = lane.current_capital * Decimal(str(decision.position_size_pct))
                    
                    can_trade, violation = lane.can_trade(
                        position_value=position_value,
                        liquidity_usd=Decimal("100000")  # Placeholder
                    )
                    
                    if can_trade:
                        # Get quote
                        quote = await self.jupiter.get_quote(
                            input_mint=sol_mint,
                            output_mint=usdc_mint,
                            amount=position_value
                        )
                        
                        # Execute paper trade
                        trade = lane.execute_paper_trade(
                            action=decision.action,
                            input_token=sol_mint,
                            output_token=usdc_mint,
                            input_amount=position_value,
                            quote=quote,
                            ai_decision=decision
                        )
                        
                        # Calculate reward and update AI
                        if trade.pnl is not None:
                            reward = float(trade.pnl_pct or 0) * 100
                            next_features = extractor.get_features(
                                current_position_pct=float(lane.current_capital / lane.initial_capital) - 1,
                                recent_pnl_pct=lane.total_pnl_pct
                            )
                            lane.ai_model.learn(features, decision.action, reward, next_features)
                        
                        console.print(
                            f"[{'green' if (trade.pnl or 0) > 0 else 'red'}]"
                            f"Lane {lane.name}: {decision.action.value} executed"
                            f"[/]"
                        )
                    else:
                        logger.debug(f"Lane {lane.id}: Trade blocked - {violation}")
                
                # Wait before next iteration
                await asyncio.sleep(self.guardrails.min_trade_interval_seconds)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Lane {lane.id} error: {e}", exc_info=True)
                await asyncio.sleep(10)
    
    async def _price_updater(self):
        """Background task to update prices"""
        while self.running:
            await self._update_prices()
            await asyncio.sleep(5)  # Update every 5 seconds
    
    async def run(self):
        """Run the trading engine"""
        self.running = True
        
        console.print(f"\n[bold cyan]🔥 SolForge Starting ({self.mode} mode)[/bold cyan]\n")
        console.print(f"Active lanes: {len(self.lanes)}")
        
        # Start background tasks
        tasks = []
        
        # Price updater
        tasks.append(asyncio.create_task(self._price_updater()))
        
        # Trading loops for each lane
        for lane in self.lanes.values():
            tasks.append(asyncio.create_task(self._trading_loop(lane)))
        
        console.print("\n[green]All lanes running. Press Ctrl+C to stop.[/green]\n")
        
        try:
            await self.shutdown_event.wait()
        except asyncio.CancelledError:
            pass
        finally:
            self.running = False
            
            # Cancel all tasks
            for task in tasks:
                task.cancel()
            
            await asyncio.gather(*tasks, return_exceptions=True)
            
            # Save AI models
            for lane in self.lanes.values():
                if lane.ai_model:
                    lane.ai_model.save()
            
            # Cleanup
            await cleanup_jupiter()
            
            console.print("\n[yellow]SolForge shut down.[/yellow]")
    
    def stop(self):
        """Signal the engine to stop"""
        self.shutdown_event.set()
    
    def get_status(self) -> dict:
        """Get current status of all lanes"""
        return {
            "mode": self.mode,
            "running": self.running,
            "lanes": {
                lane_id: lane.get_state().model_dump()
                for lane_id, lane in self.lanes.items()
            }
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(description="SolForge AI Trading Bot")
    parser.add_argument(
        "--mode", 
        choices=["paper", "live"],
        default="paper",
        help="Trading mode (default: paper)"
    )
    parser.add_argument(
        "--config",
        default="config/config.yaml",
        help="Path to config file"
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Logging level"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.log_level)
    
    # Load config
    config = load_config(args.config)
    config["app"]["mode"] = args.mode
    
    # Create engine
    engine = SolForgeEngine(config)
    
    # Handle shutdown signals
    def handle_shutdown(sig, frame):
        console.print("\n[yellow]Shutting down...[/yellow]")
        engine.stop()
    
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
    
    # Run
    asyncio.run(engine.run())


if __name__ == "__main__":
    main()
