"""
SolForge Virtual Wallet
Manages virtual token balances for paper trading
"""
from decimal import Decimal
from typing import Dict, Optional
from datetime import datetime
import logging

from .models import TokenBalance

logger = logging.getLogger(__name__)


class InsufficientBalanceError(Exception):
    """Raised when wallet has insufficient balance for a trade"""
    pass


class VirtualWallet:
    """
    Virtual wallet for paper trading.
    Tracks token balances without actual blockchain transactions.
    """
    
    # Default token symbols for common mints
    MINT_SYMBOLS = {
        "So11111111111111111111111111111111111111112": "SOL",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
    }
    
    def __init__(self, lane_id: str, initial_sol_amount: Decimal = Decimal("0")):
        """
        Initialize virtual wallet.
        
        Args:
            lane_id: Identifier for the trading lane
            initial_sol_amount: Starting SOL balance
        """
        self.lane_id = lane_id
        self.created_at = datetime.utcnow()
        
        # Token balances: mint_address -> Decimal amount
        self._balances: Dict[str, Decimal] = {}
        
        # Initialize with SOL if provided
        if initial_sol_amount > 0:
            sol_mint = "So11111111111111111111111111111111111111112"
            self._balances[sol_mint] = initial_sol_amount
            logger.info(f"Wallet {lane_id} initialized with {initial_sol_amount} SOL")
    
    def get_balance(self, mint: str) -> Decimal:
        """Get balance for a specific token"""
        return self._balances.get(mint, Decimal("0"))
    
    def get_all_balances(self) -> Dict[str, TokenBalance]:
        """Get all non-zero token balances"""
        balances = {}
        for mint, amount in self._balances.items():
            if amount > 0:
                symbol = self.MINT_SYMBOLS.get(mint, mint[:8])
                balances[mint] = TokenBalance(
                    mint=mint,
                    symbol=symbol,
                    amount=amount
                )
        return balances
    
    def deposit(self, mint: str, amount: Decimal) -> Decimal:
        """
        Deposit tokens into wallet.
        
        Args:
            mint: Token mint address
            amount: Amount to deposit
            
        Returns:
            New balance
        """
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        
        current = self._balances.get(mint, Decimal("0"))
        new_balance = current + amount
        self._balances[mint] = new_balance
        
        symbol = self.MINT_SYMBOLS.get(mint, mint[:8])
        logger.debug(f"Wallet {self.lane_id}: Deposited {amount} {symbol}, new balance: {new_balance}")
        
        return new_balance
    
    def withdraw(self, mint: str, amount: Decimal) -> Decimal:
        """
        Withdraw tokens from wallet.
        
        Args:
            mint: Token mint address
            amount: Amount to withdraw
            
        Returns:
            New balance
            
        Raises:
            InsufficientBalanceError: If balance is too low
        """
        if amount <= 0:
            raise ValueError("Withdraw amount must be positive")
        
        current = self._balances.get(mint, Decimal("0"))
        
        if current < amount:
            symbol = self.MINT_SYMBOLS.get(mint, mint[:8])
            raise InsufficientBalanceError(
                f"Insufficient {symbol} balance: have {current}, need {amount}"
            )
        
        new_balance = current - amount
        self._balances[mint] = new_balance
        
        symbol = self.MINT_SYMBOLS.get(mint, mint[:8])
        logger.debug(f"Wallet {self.lane_id}: Withdrew {amount} {symbol}, new balance: {new_balance}")
        
        return new_balance
    
    def swap(
        self,
        input_mint: str,
        output_mint: str,
        input_amount: Decimal,
        output_amount: Decimal,
        fee_amount: Decimal = Decimal("0")
    ) -> tuple[Decimal, Decimal]:
        """
        Execute a virtual swap (paper trade).
        
        Args:
            input_mint: Token being sold
            output_mint: Token being bought
            input_amount: Amount of input token
            output_amount: Amount of output token to receive
            fee_amount: Transaction fee (in input token)
            
        Returns:
            Tuple of (new input balance, new output balance)
        """
        total_input = input_amount + fee_amount
        
        # Check balance
        input_balance = self.get_balance(input_mint)
        if input_balance < total_input:
            input_symbol = self.MINT_SYMBOLS.get(input_mint, input_mint[:8])
            raise InsufficientBalanceError(
                f"Insufficient {input_symbol}: have {input_balance}, need {total_input}"
            )
        
        # Execute swap
        new_input = self.withdraw(input_mint, total_input)
        new_output = self.deposit(output_mint, output_amount)
        
        input_symbol = self.MINT_SYMBOLS.get(input_mint, input_mint[:8])
        output_symbol = self.MINT_SYMBOLS.get(output_mint, output_mint[:8])
        
        logger.info(
            f"Wallet {self.lane_id}: Swapped {input_amount} {input_symbol} "
            f"-> {output_amount} {output_symbol} (fee: {fee_amount})"
        )
        
        return new_input, new_output
    
    def get_total_value_usd(self, prices: Dict[str, Decimal]) -> Decimal:
        """
        Calculate total wallet value in USD.
        
        Args:
            prices: Dict mapping mint addresses to USD prices
            
        Returns:
            Total USD value
        """
        total = Decimal("0")
        for mint, amount in self._balances.items():
            if amount > 0 and mint in prices:
                total += amount * prices[mint]
        return total
    
    def to_dict(self) -> dict:
        """Serialize wallet state"""
        return {
            "lane_id": self.lane_id,
            "created_at": self.created_at.isoformat(),
            "balances": {mint: str(amt) for mint, amt in self._balances.items()}
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "VirtualWallet":
        """Deserialize wallet state"""
        wallet = cls(lane_id=data["lane_id"])
        wallet.created_at = datetime.fromisoformat(data["created_at"])
        wallet._balances = {
            mint: Decimal(amt) for mint, amt in data["balances"].items()
        }
        return wallet
