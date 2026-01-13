
from fastapi import APIRouter, Request, HTTPException
from typing import List, Dict
from pydantic import BaseModel

from src.core.models import LaneState, Trade, LaneStatus, LaneAnalytics, PnLPoint
import numpy as np

router = APIRouter()

class SystemStatus(BaseModel):
    status: str
    uptime: float
    active_lanes: int
    total_pnl: str

@router.get("/status", response_model=SystemStatus)
async def get_system_status(request: Request):
    """Get overall system status"""
    orch = request.app.state.orchestrator
    try:
        summary = orch.paper_engine.get_summary()
        return SystemStatus(
            status=summary["status"],
            uptime=summary["uptime_seconds"],
            active_lanes=summary["active_lanes"],
            total_pnl=summary["total_pnl"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/lanes", response_model=List[LaneState])
async def get_lanes(request: Request):
    """Get all trading lanes"""
    orch = request.app.state.orchestrator
    # We return the Pydantic models (get_state())
    lanes = [lane.get_state() for lane in orch.paper_engine.get_all_lanes()]
    return lanes

@router.get("/lanes/{lane_id}", response_model=LaneState)
async def get_lane(lane_id: str, request: Request):
    """Get specific lane details"""
    orch = request.app.state.orchestrator
    lane = orch.paper_engine.get_lane(lane_id)
    if not lane:
        raise HTTPException(status_code=404, detail="Lane not found")
    return lane.get_state()

@router.post("/lanes/{lane_id}/start")
async def start_lane(lane_id: str, request: Request):
    """Start a lane"""
    orch = request.app.state.orchestrator
    lane = orch.paper_engine.get_lane(lane_id)
    if not lane:
        raise HTTPException(status_code=404, detail="Lane not found")
    
    # In a full impl, we'd have a lane.start() method
    if lane.status != LaneStatus.KILLED:
        lane.status = LaneStatus.ACTIVE
        return {"status": "started", "lane_id": lane_id}
    else:
         raise HTTPException(status_code=400, detail="Cannot start killed lane")

@router.post("/lanes/{lane_id}/stop")
async def stop_lane(lane_id: str, request: Request):
    """Stop/Pause a lane"""
    orch = request.app.state.orchestrator
    lane = orch.paper_engine.get_lane(lane_id)
    if not lane:
        raise HTTPException(status_code=404, detail="Lane not found")
    
    lane.status = LaneStatus.PAUSED
    return {"status": "paused", "lane_id": lane_id}

@router.get("/lanes/{lane_id}/trades", response_model=List[Trade])
async def get_lane_trades(lane_id: str, request: Request, limit: int = 50):
    """Get trades for a lane"""
    orch = request.app.state.orchestrator
    
    # Check if lane exists first
    if not orch.paper_engine.get_lane(lane_id):
        raise HTTPException(status_code=404, detail="Lane not found")
        
    trades = orch.trade_repo.get_trades_for_lane(lane_id, limit=limit)
    return trades

@router.get("/trades", response_model=List[Trade])
async def get_recent_trades(request: Request, limit: int = 20):
    """Get recent trades across all lanes"""
    orch = request.app.state.orchestrator
    # We don't have a direct repo method for this yet, so we cheat and fetch all and sort
    # In a real app, add get_all_trades to repository
    # Efficient enough for MVP with low trade volume
    all_trades = []
    for lane in orch.paper_engine.get_all_lanes():
        all_trades.extend(orch.trade_repo.get_trades_for_lane(lane.id, limit=limit))
    
    # Sort by timestamp desc
    all_trades.sort(key=lambda t: t.timestamp, reverse=True)
    return all_trades[:limit]

@router.get("/export/csv")
async def export_trades_csv(request: Request):
    """Export all trades as CSV"""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    orch = request.app.state.orchestrator
    
    # Gather all trades
    all_trades = []
    for lane in orch.paper_engine.get_all_lanes():
        trades = orch.trade_repo.get_trades_for_lane(lane.id, limit=10000)
        # Add lane name for context
        for t in trades:
            t_dict = t.dict()
            t_dict['lane_name'] = lane.name
            all_trades.append(t_dict)
            
    # Sort by timestamp
    all_trades.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Timestamp', 'Lane', 'Token', 'Action', 'Price', 'Amount', 'PnL', 'PnL%'])
    
    for t in all_trades:
        writer.writerow([
            t['timestamp'],
            t.get('lane_name', 'Unknown'),
            t['token_symbol'],
            t['action'],
            t['price'],
            t['amount'],
            t['pnl'] if t['pnl'] is not None else '',
            f"{t['pnl_pct']}%" if t['pnl_pct'] is not None else ''
        ])
        
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=solforge_trades.csv"}
    )
@router.get("/lanes/{lane_id}/analytics", response_model=LaneAnalytics)
async def get_lane_analytics(lane_id: str, request: Request):
    """Get advanced analytics for a lane"""
    from decimal import Decimal

    orch = request.app.state.orchestrator
    lane = orch.paper_engine.get_lane(lane_id)
    if not lane:
        raise HTTPException(status_code=404, detail="Lane not found")

    trades = orch.trade_repo.get_trades_for_lane(lane_id, limit=1000)
    # Sort by timestamp
    trades.sort(key=lambda t: t.timestamp)

    # Reconstruct history
    history = []
    current_pnl = 0.0
    initial_cap = float(lane.initial_capital)
    current_val = initial_cap

    # Add initial point
    history.append(PnLPoint(
        timestamp=lane.created_at,
        pnl=0.0,
        total_value=initial_cap
    ))

    returns = []
    wins = []
    losses = []

    for t in trades:
        if t.pnl is not None:
            pnl_val = float(t.pnl)
            current_pnl += pnl_val
            current_val += pnl_val

            history.append(PnLPoint(
                timestamp=t.timestamp,
                pnl=current_pnl,
                total_value=current_val
            ))

            # For Sharpe/Analytics
            pnl_pct = float(t.pnl_pct or 0)
            returns.append(pnl_pct)

            if pnl_val > 0:
                wins.append(pnl_val)
            elif pnl_val < 0:
                losses.append(abs(pnl_val))

    # 1. Sharpe Ratio (Simple implementation)
    sharpe = 0.0
    if len(returns) > 1:
        mean_ret = np.mean(returns)
        std_ret = np.std(returns)
        if std_ret > 0:
            sharpe = (mean_ret / std_ret) * np.sqrt(252) # Assume 252 trade-days/ticks

    # 2. Max Drawdown
    max_dd = 0.0
    if history:
        vals = [p.total_value for p in history]
        peak = vals[0]
        for v in vals:
            if v > peak:
                peak = v
            dd = (peak - v) / peak if peak > 0 else 0
            if dd > max_dd:
                max_dd = dd

    # 3. Profit Factor
    profit_factor = 0.0
    sum_wins = sum(wins)
    sum_losses = sum(losses)
    if sum_losses > 0:
        profit_factor = sum_wins / sum_losses
    elif sum_wins > 0:
        profit_factor = 99.0 # High value if no losses

    return LaneAnalytics(
        lane_id=lane_id,
        sharpe_ratio=float(sharpe),
        max_drawdown=float(max_dd),
        profit_factor=float(profit_factor),
        pnl_history=history
    )

@router.get("/lanes/{lane_id}/readiness")
async def get_lane_readiness(lane_id: str, request: Request):
    """Get readiness score for a lane (determines if ready for live trading)"""
    orch = request.app.state.orchestrator
    lane = orch.paper_engine.get_lane(lane_id)
    if not lane:
        raise HTTPException(status_code=404, detail="Lane not found")

    # Get lane state and trades
    lane_state = lane.get_state()
    trades = orch.trade_repo.get_trades_for_lane(lane_id, limit=1000)

    # Calculate readiness score
    readiness_data = orch.readiness_scorer.calculate_readiness(lane_state, trades)

    return readiness_data
