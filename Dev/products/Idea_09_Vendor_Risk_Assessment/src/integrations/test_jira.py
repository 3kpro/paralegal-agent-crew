import sys
import os
import logging

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.integrations.jira_connector import JiraConnector

# Setup logging
logging.basicConfig(level=logging.INFO)

def test_jira_mock_interaction():
    print("Testing Jira Connector (Mock Mode)...")
    
    # Initialize without creds to force mock mode
    connector = JiraConnector(server=None, email=None, api_token=None)
    
    # Test Ticket Creation
    summary = "High Risk: Missing SOC 2 Report"
    description = "Vendor Acme Corp is missing a valid SOC 2 Type II report for 2024."
    
    print(f"\n[1] Creating Ticket: '{summary}'...")
    key = connector.create_risk_ticket(summary, description, priority="High")
    
    if key and key.startswith("MOCK-"):
        print(f"SUCCESS: Mock ticket created with key: {key}")
    else:
        print(f"FAILURE: Unexpected result: {key}")

    # Test Status Check
    print(f"\n[2] Checking Status for {key}...")
    status = connector.get_ticket_status(key)
    print(f"Status: {status}")
    
    if status == "Open":
        print("SUCCESS: Mock status retrieved.")
    else:
         print(f"FAILURE: Unexpected status: {status}")

if __name__ == "__main__":
    test_jira_mock_interaction()
