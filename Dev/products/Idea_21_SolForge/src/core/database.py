"""
SolForge Database Layer
Persists trading data and state using SQLAlchemy.
"""
from datetime import datetime
from typing import Optional, List, Any
import json
from decimal import Decimal

from sqlalchemy import (
    create_engine, Column, String, Integer, Float, 
    Boolean, DateTime, ForeignKey, Text, TypeDecorator
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from sqlalchemy.types import TypeDecorator

from .models import (
    LaneState, Trade, TradeAction, TradeStatus, RiskProfile, LaneStatus
)

# SQLite for Dev / PostgreSQL for Prod
DATABASE_URL = "sqlite:///./data/solforge.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class TypeJSON(TypeDecorator):
    """Enables JSON storage for SQLite"""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return json.loads(value)


class LaneSQL(Base):
    """SQLAlchemy model for TradingLane state"""
    __tablename__ = "lanes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    profile = Column(String)  # RiskProfile enum value
    status = Column(String)   # LaneStatus enum value
    
    created_at = Column(DateTime, default=datetime.utcnow)
    initial_capital = Column(String)  # Stored as string to preserve Decimal precision
    current_capital = Column(String)
    
    total_pnl = Column(String, default="0")
    total_pnl_pct = Column(Float, default=0.0)
    
    win_count = Column(Integer, default=0)
    loss_count = Column(Integer, default=0)
    total_trades = Column(Integer, default=0)
    consecutive_losses = Column(Integer, default=0)
    
    last_trade_at = Column(DateTime, nullable=True)
    cooldown_until = Column(DateTime, nullable=True)
    
    ai_model_version = Column(String, default="v0.1")
    readiness_score = Column(Float, default=0.0)
    
    # Relationships
    trades = relationship("TradeSQL", back_populates="lane")


class TradeSQL(Base):
    """SQLAlchemy model for Trade records"""
    __tablename__ = "trades"

    id = Column(String, primary_key=True, index=True)
    lane_id = Column(String, ForeignKey("lanes.id"), index=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    action = Column(String)  # TradeAction enum
    
    input_token = Column(String)
    output_token = Column(String)
    input_amount = Column(String)  # Stored as string
    output_amount = Column(String, nullable=True)
    
    price_at_entry = Column(String)
    price_at_exit = Column(String, nullable=True)
    
    slippage_bps = Column(Integer, nullable=True)
    fees_paid = Column(String, default="0")
    
    pnl = Column(String, nullable=True)
    pnl_pct = Column(Float, nullable=True)
    
    status = Column(String)  # TradeStatus enum
    
    ai_confidence = Column(Float, nullable=True)
    ai_reasoning = Column(Text, nullable=True)
    
    metadata_json = Column(TypeJSON, nullable=True)  # Store robust metadata
    
    # Relationships
    lane = relationship("LaneSQL", back_populates="trades")


def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency for DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Converters ---

def lane_to_sql(lane: LaneState) -> LaneSQL:
    """Convert Pydantic LaneState to SQLAlchemy model"""
    return LaneSQL(
        id=lane.id,
        name=lane.name,
        profile=lane.profile.value,
        status=lane.status.value,
        created_at=lane.created_at,
        initial_capital=str(lane.initial_capital),
        current_capital=str(lane.current_capital),
        total_pnl=str(lane.total_pnl),
        total_pnl_pct=lane.total_pnl_pct,
        win_count=lane.win_count,
        loss_count=lane.loss_count,
        total_trades=lane.total_trades,
        consecutive_losses=lane.consecutive_losses,
        last_trade_at=lane.last_trade_at,
        cooldown_until=lane.cooldown_until,
        ai_model_version=lane.ai_model_version,
        readiness_score=lane.readiness_score
    )

def lane_from_sql(sql: LaneSQL) -> LaneState:
    """Convert SQLAlchemy model to Pydantic LaneState"""
    return LaneState(
        id=sql.id,
        name=sql.name,
        profile=RiskProfile(sql.profile),
        status=LaneStatus(sql.status),
        created_at=sql.created_at,
        initial_capital=Decimal(sql.initial_capital),
        current_capital=Decimal(sql.current_capital),
        total_pnl=Decimal(sql.total_pnl),
        total_pnl_pct=sql.total_pnl_pct,
        win_count=sql.win_count,
        loss_count=sql.loss_count,
        total_trades=sql.total_trades,
        consecutive_losses=sql.consecutive_losses,
        last_trade_at=sql.last_trade_at,
        cooldown_until=sql.cooldown_until,
        ai_model_version=sql.ai_model_version,
        readiness_score=sql.readiness_score
    )

def trade_to_sql(trade: Trade) -> TradeSQL:
    """Convert Pydantic Trade to SQLAlchemy model"""
    return TradeSQL(
        id=trade.id,
        lane_id=trade.lane_id,
        timestamp=trade.timestamp,
        action=trade.action.value,
        input_token=trade.input_token,
        output_token=trade.output_token,
        input_amount=str(trade.input_amount),
        output_amount=str(trade.output_amount) if trade.output_amount else None,
        price_at_entry=str(trade.price_at_entry),
        price_at_exit=str(trade.price_at_exit) if trade.price_at_exit else None,
        slippage_bps=trade.slippage_bps,
        fees_paid=str(trade.fees_paid),
        pnl=str(trade.pnl) if trade.pnl else None,
        pnl_pct=trade.pnl_pct,
        status=trade.status.value,
        ai_confidence=trade.ai_confidence,
        ai_reasoning=trade.ai_reasoning,
        metadata_json=trade.metadata
    )

def trade_from_sql(sql: TradeSQL) -> Trade:
    """Convert SQLAlchemy model to Pydantic Trade"""
    return Trade(
        id=sql.id,
        lane_id=sql.lane_id,
        timestamp=sql.timestamp,
        action=TradeAction(sql.action),
        input_token=sql.input_token,
        output_token=sql.output_token,
        input_amount=Decimal(sql.input_amount),
        output_amount=Decimal(sql.output_amount) if sql.output_amount else None,
        price_at_entry=Decimal(sql.price_at_entry),
        price_at_exit=Decimal(sql.price_at_exit) if sql.price_at_exit else None,
        slippage_bps=sql.slippage_bps,
        fees_paid=Decimal(sql.fees_paid),
        pnl=Decimal(sql.pnl) if sql.pnl else None,
        pnl_pct=sql.pnl_pct,
        status=TradeStatus(sql.status),
        ai_confidence=sql.ai_confidence,
        ai_reasoning=sql.ai_reasoning,
        metadata=sql.metadata_json or {}
    )

# --- Repository Methods ---

class LaneRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_lane(self, lane: LaneState):
        """Upsert lane state"""
        db_lane = self.db.query(LaneSQL).filter(LaneSQL.id == lane.id).first()
        if db_lane:
            # Update
            for key, value in lane_to_sql(lane).__dict__.items():
                if not key.startswith('_'):
                    setattr(db_lane, key, value)
        else:
            # Insert
            db_lane = lane_to_sql(lane)
            self.db.add(db_lane)
        self.db.commit()
        return db_lane

    def get_lane(self, lane_id: str) -> Optional[LaneState]:
        db_lane = self.db.query(LaneSQL).filter(LaneSQL.id == lane_id).first()
        if db_lane:
            return lane_from_sql(db_lane)
        return None

    def list_lanes(self) -> List[LaneState]:
        db_lanes = self.db.query(LaneSQL).all()
        return [lane_from_sql(l) for l in db_lanes]

class TradeRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def save_trade(self, trade: Trade):
        """Upsert trade"""
        db_trade = self.db.query(TradeSQL).filter(TradeSQL.id == trade.id).first()
        if db_trade:
            # Update (less common for trades, maybe only status/exit)
            for key, value in trade_to_sql(trade).__dict__.items():
                if not key.startswith('_'):
                    setattr(db_trade, key, value)
        else:
            self.db.add(trade_to_sql(trade))
        self.db.commit()

    def get_trades_for_lane(self, lane_id: str, limit: int = 100) -> List[Trade]:
        db_trades = self.db.query(TradeSQL)\
            .filter(TradeSQL.lane_id == lane_id)\
            .order_by(TradeSQL.timestamp.desc())\
            .limit(limit).all()
        return [trade_from_sql(t) for t in db_trades]
