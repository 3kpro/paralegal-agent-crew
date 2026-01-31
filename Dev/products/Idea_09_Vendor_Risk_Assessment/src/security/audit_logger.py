import logging
import json
from datetime import datetime
from typing import Optional, Any
from src.models.audit import AuditEvent, AuditAction

# Setup generic python logger
logger = logging.getLogger("audit_logger")
logger.setLevel(logging.INFO)

# File handler for local fallback
fh = logging.FileHandler("audit.log")
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
logger.addHandler(fh)

class AuditLogger:
    """
    Middleware/Service for structured audit logging.
    In a real app, this would write to the DB asynchronously.
    """
    
    @staticmethod
    def log_event(
        action: str,
        user_id: str,
        org_id: str,
        target: str,
        details: Optional[dict] = None,
        ip: str = "127.0.0.1"
    ):
        """
        Logs an undeniable record of a user action.
        """
        
        event_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "user_id": user_id,
            "organization_id": org_id,
            "target": target,
            "details": details or {},
            "ip_address": ip
        }
        
        # 1. Log to file (JSON for machine parsing)
        logger.info(json.dumps(event_data))
        
        # 2. In Production: Write to DB
        # session.add(AuditEvent(...))
        # session.commit()
        
        print(f"🔒 AUDIT: User {user_id} performed {action} on {target}")

