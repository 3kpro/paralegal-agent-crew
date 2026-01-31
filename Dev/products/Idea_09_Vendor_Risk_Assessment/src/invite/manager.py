import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from ..models.invitation import Invitation, InvitationStatus
from ..models.vendor import Vendor

logger = logging.getLogger(__name__)

class InvitationManager:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.base_url = "https://vendorscope.app/invite" # Mock URL

    def create_invitation(self, vendor_id: str, email: str, expiry_days: int = 7) -> Invitation:
        """
        Creates a new invitation for a vendor contact.
        """
        # Check if pending invite exists
        existing = self.db.query(Invitation).filter(
            Invitation.vendor_id == vendor_id,
            Invitation.email == email,
            Invitation.status == InvitationStatus.PENDING
        ).first()

        if existing:
            # If expired, we can recreate or extend. For now, let's just return it or error.
            # Let's say we return the existing one if it's still valid.
            if existing.is_valid():
                logger.info(f"Existing valid invitation found for {email}")
                return existing
            else:
                # Mark as expired if not already
                existing.status = InvitationStatus.EXPIRED
                self.db.add(existing) # Ensure it's updated

        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=expiry_days)

        invite = Invitation(
            vendor_id=vendor_id,
            email=email,
            token=token,
            expires_at=expires_at,
            status=InvitationStatus.PENDING
        )

        self.db.add(invite)
        self.db.commit()
        self.db.refresh(invite)
        
        return invite

    def get_invite_link(self, invite: Invitation) -> str:
        return f"{self.base_url}?token={invite.token}"

    def send_invite_email(self, invite: Invitation) -> bool:
        """
        Mocks sending an email.
        In a real app, integrate with SendGrid/AWS SES.
        """
        link = self.get_invite_link(invite)
        vendor = self.db.query(Vendor).get(invite.vendor_id)
        vendor_name = vendor.name if vendor else "Unknown Vendor"

        logger.info(f"--- EMAIL SIMULATION ---")
        logger.info(f"To: {invite.email}")
        logger.info(f"Subject: Security Assessment Request for {vendor_name}")
        logger.info(f"Body: Please upload your security documents here: {link}")
        logger.info(f"------------------------")

        invite.status = InvitationStatus.SENT
        self.db.commit()
        return True

    def verify_token(self, token: str) -> Optional[Invitation]:
        """
        Verifies if a token is valid and returns the Invitation object.
        """
        invite = self.db.query(Invitation).filter(Invitation.token == token).first()

        if not invite:
            logger.warning(f"Invalid token attempt: {token}")
            return None

        if not invite.is_valid():
            logger.warning(f"Expired or invalid invite accessed: {invite.id}")
            return None

        # Optionally mark as OPENED if it was SENT
        if invite.status == InvitationStatus.SENT:
            invite.status = InvitationStatus.OPENED
            self.db.commit()

        return invite
