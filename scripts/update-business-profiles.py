#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Business Profile Update Script
Programmatically updates business profiles for xelora and 3kpro.services
"""

import json
import sys
import os

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
XELORA_CONFIG = {
    'website': 'https://getxelora.com',
    'email': 'support@3kpro.services',
    'phone': '+1-918-816-8832',
    'business_type': 'SERVICE_AREA',  # No physical location
}

THREEKPRO_CONFIG = {
    'website': 'https://3kpro.services',
    'email': 'james@3kpro.services',
    'phone': '+1-918-816-8832',
    'business_type': 'SERVICE_AREA',  # No physical location shown
    'service_area': 'Tulsa, Oklahoma',
}

def get_credentials():
    """Load credentials from gcloud auth"""
    import subprocess

    # Get the access token from gcloud
    result = subprocess.run(
        ['gcloud', 'auth', 'application-default', 'print-access-token'],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"Error getting access token: {result.stderr}")
        sys.exit(1)

    access_token = result.stdout.strip()

    # Create credentials object
    creds = Credentials(token=access_token)
    return creds

def list_accounts(service):
    """List all Google Business Profile accounts"""
    try:
        accounts = service.accounts().list().execute()
        return accounts.get('accounts', [])
    except HttpError as error:
        print(f"An error occurred: {error}")
        return []

def list_locations(service, account_name):
    """List all locations for an account"""
    try:
        locations = service.accounts().locations().list(
            parent=account_name,
            readMask='name,title,websiteUri,phoneNumbers,profile'
        ).execute()
        return locations.get('locations', [])
    except HttpError as error:
        print(f"An error occurred: {error}")
        return []

def update_location(service, location_name, updates):
    """Update a business location"""
    try:
        result = service.accounts().locations().patch(
            name=location_name,
            updateMask=','.join(updates.keys()),
            body=updates
        ).execute()
        return result
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None

def main():
    print("🔧 Google Business Profile Update Script")
    print("=" * 70)

    # Get credentials
    print("\n📡 Authenticating with Google...")
    creds = get_credentials()

    # Build the service
    try:
        service = build('mybusinessbusinessinformation', 'v1', credentials=creds)
        print("✅ Service initialized")
    except Exception as e:
        print(f"❌ Failed to initialize service: {e}")
        sys.exit(1)

    # List accounts
    print("\n📋 Fetching Business Profile accounts...")
    accounts = list_accounts(service)

    if not accounts:
        print("❌ No accounts found or unable to access accounts")
        print("   This may be due to:")
        print("   - API quota limitations")
        print("   - Insufficient permissions")
        print("   - No Business Profiles associated with this account")
        sys.exit(1)

    print(f"✅ Found {len(accounts)} account(s):")
    for account in accounts:
        print(f"   - {account.get('accountName')} ({account.get('name')})")

    # Process each account
    for account in accounts:
        account_name = account.get('name')
        print(f"\n🏢 Processing account: {account.get('accountName')}")

        # List locations
        locations = list_locations(service, account_name)

        if not locations:
            print("   ⚠️  No locations found for this account")
            continue

        print(f"   Found {len(locations)} location(s):")

        for location in locations:
            title = location.get('title', 'Unknown')
            location_name = location.get('name')
            current_website = location.get('websiteUri', 'Not set')

            print(f"\n   📍 {title}")
            print(f"      Location ID: {location_name}")
            print(f"      Current Website: {current_website}")

            # Determine which config to use
            config = None
            if 'xelora' in title.lower() or 'xelora.app' in current_website:
                config = XELORA_CONFIG
                print(f"      🎯 Identified as XELORA - will update")
            elif '3k' in title.lower() or 'pro' in title.lower() or '3kpro' in title.lower():
                config = THREEKPRO_CONFIG
                print(f"      🎯 Identified as 3KPRO - will update")
            else:
                print(f"      ⏭️  Skipping - doesn't match known brands")
                continue

            # Prepare updates
            updates = {
                'websiteUri': config['website'],
                'phoneNumbers': {
                    'primaryPhone': config['phone']
                },
                'profile': {
                    'description': f"Contact: {config['email']}"
                }
            }

            print(f"      📝 Updating to:")
            print(f"         Website: {config['website']}")
            print(f"         Phone: {config['phone']}")
            print(f"         Email: {config['email']}")

            # Update the location
            result = update_location(service, location_name, updates)

            if result:
                print(f"      ✅ Successfully updated!")
            else:
                print(f"      ❌ Update failed")

    print("\n" + "=" * 70)
    print("✨ Update process complete!")
    print("\nℹ️  Note: Changes may take 24-72 hours to appear in Google Search")

if __name__ == '__main__':
    main()
