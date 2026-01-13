import asyncio
import os
import sys
from decimal import Decimal
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
import base58

async def verify_config():
    print("--- SolForge Mainnet Config Verifier ---")
    
    # 1. Check RPC
    rpc_url = os.getenv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com")
    print(f"[*] Checking RPC: {rpc_url}")
    try:
        async with AsyncClient(rpc_url) as client:
            is_connected = await client.is_connected()
            if not is_connected:
                print("[!] RPC unreachable.")
                return False
            
            # Check block height
            height = await client.get_block_height()
            print(f"[+] RPC pulse detected. Block height: {height.value}")
    except Exception as e:
        print(f"[!] RPC Error: {e}")
        return False

    # 2. Check Private Key
    pk_str = os.getenv("SOLANA_PRIVATE_KEY")
    if not pk_str:
        print("[!] SOLANA_PRIVATE_KEY not set in environment.")
        return False
        
    print("[*] Decoding private key...")
    try:
        decoded = base58.b58decode(pk_str)
        keypair = Keypair.from_bytes(decoded)
        pubkey = keypair.pubkey()
        print(f"[+] Key decoded. Pubkey: {pubkey}")
    except Exception as e:
        print(f"[!] Invalid private key format: {e}")
        return False

    # 3. Check Balance
    print(f"[*] Fetching SOL balance for {pubkey}...")
    try:
        async with AsyncClient(rpc_url) as client:
            balance_res = await client.get_balance(pubkey)
            lamports = balance_res.value
            sol = Decimal(lamports) / Decimal(10**9)
            print(f"[+] Balance: {sol:.4f} SOL")
            
            if sol < Decimal("0.05"):
                print("[!] WARNING: Balance low. Recommend > 0.05 SOL for fees and small trades.")
            else:
                print("[+] Balance sufficient for Mainnet Scout.")
    except Exception as e:
        print(f"[!] Balance fetch failed: {e}")
        return False

    print("\n--- [PASSED] SolForge is ready for Mainnet Scout Run! ---")
    return True

if __name__ == "__main__":
    if not asyncio.run(verify_config()):
        sys.exit(1)
