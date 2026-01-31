import sys
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.models.base import Base
from src.models.vendor import Vendor
from src.models.invitation import Invitation, InvitationStatus
from src.invite.manager import InvitationManager

# Setup Logging
logging.basicConfig(level=logging.INFO)

def test_invitation_flow():
    # Setup In-Memory DB
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create dummy vendor
    vendor = Vendor(name="Test Vendor", domain="testVendor.com")
    session.add(vendor)
    session.commit()
    
    print(f"Created Vendor: {vendor.id}")

    # Initialize Manager
    manager = InvitationManager(session)

    # 1. Create Invitation
    email = "security@testvendor.com"
    print(f"\n[1] Creating invitation for {email}...")
    invite = manager.create_invitation(vendor.id, email)
    print(f"Invite Created: {invite.token} (Status: {invite.status})")

    # 2. Send Email (Mock)
    print(f"\n[2] Sending email...")
    manager.send_invite_email(invite)
    print(f"Invite Status: {invite.status}")

    # 3. Verify Token
    print(f"\n[3] Verifying token {invite.token}...")
    verified_invite = manager.verify_token(invite.token)
    
    if verified_invite:
        print(f"Token Verified! Link opened for vendor: {verified_invite.vendor.name}")
        print(f"New Status: {verified_invite.status}")
    else:
        print("Token Verification Failed!")

    # 4. Test Invalid Token
    print(f"\n[4] Testing invalid token...")
    bad_invite = manager.verify_token("invalid_token_string")
    if not bad_invite:
        print("Invalid token correctly rejected.")

    session.close()

if __name__ == "__main__":
    test_invitation_flow()
