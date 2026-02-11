#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Business Profile Browser Automation
Automates updating business profiles via web interface
"""

import sys
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuration
XELORA_CONFIG = {
    'website': 'https://getxelora.com',
    'email': 'support@3kpro.services',
    'phone': '+1-918-816-8832',
}

THREEKPRO_CONFIG = {
    'website': 'https://3kpro.services',
    'email': 'james@3kpro.services',
    'phone': '918-816-8832',  # Format without country code for form entry
}

def main():
    print("=== Google Business Profile Automation ===")
    print("Opening browser to business.google.com...")

    with sync_playwright() as p:
        # Launch browser in non-headless mode so user can authenticate
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to Google Business Profile
            print("\nNavigating to business.google.com...")
            page.goto("https://business.google.com/", timeout=60000)

            # Wait for user to authenticate
            print("\n" + "="*70)
            print("IMPORTANT: Please sign in with james.lawson@gmail.com")
            print("="*70)
            print("\nWaiting for authentication...")

            # Wait for the main page to load after auth (look for common elements)
            try:
                page.wait_for_selector('[role="main"]', timeout=300000)  # 5 min timeout for auth
                print("Authentication detected!")
            except PlaywrightTimeout:
                print("Authentication timeout - continuing anyway...")

            time.sleep(3)

            # Try to find and list all business profiles
            print("\nLooking for business listings...")

            # Take screenshot for debugging
            page.screenshot(path="business-profile-main.png")
            print("Screenshot saved: business-profile-main.png")

            # Look for business profile cards or links
            try:
                # Try to find profile links
                profiles = page.locator('[data-test-id*="business"], [data-businessid], .business-card').all()

                if profiles:
                    print(f"\nFound {len(profiles)} business profile(s)")

                    for idx, profile in enumerate(profiles, 1):
                        print(f"\nProcessing profile {idx}...")

                        try:
                            # Click on the profile
                            profile.click(timeout=10000)
                            time.sleep(2)

                            # Take screenshot
                            page.screenshot(path=f"business-profile-{idx}.png")
                            print(f"Screenshot saved: business-profile-{idx}.png")

                            # Get page title or text to identify which business this is
                            page_text = page.inner_text('body').lower()

                            if 'xelora' in page_text:
                                print("Identified as XELORA profile")
                                config = XELORA_CONFIG
                            elif '3k' in page_text or 'pro' in page_text:
                                print("Identified as 3KPRO profile")
                                config = THREEKPRO_CONFIG
                            else:
                                print("Could not identify business - skipping")
                                page.go_back()
                                continue

                            # Try to find and click edit button
                            edit_buttons = page.locator('button:has-text("Edit"), [aria-label*="Edit"], [data-test-id*="edit"]').all()

                            if edit_buttons:
                                print(f"Found {len(edit_buttons)} edit button(s)")
                                edit_buttons[0].click(timeout=10000)
                                time.sleep(2)

                                # Try to fill in website
                                website_inputs = page.locator('input[type="url"], input[name*="website"], input[placeholder*="website"]').all()
                                if website_inputs:
                                    print(f"Updating website to: {config['website']}")
                                    website_inputs[0].fill(config['website'])

                                # Try to fill in phone
                                phone_inputs = page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]').all()
                                if phone_inputs:
                                    print(f"Updating phone to: {config['phone']}")
                                    phone_inputs[0].fill(config['phone'])

                                # Try to find save button
                                save_buttons = page.locator('button:has-text("Save"), button:has-text("Apply"), [data-test-id*="save"]').all()
                                if save_buttons:
                                    print("Clicking save...")
                                    save_buttons[0].click()
                                    time.sleep(2)
                                    print("Changes saved!")
                                else:
                                    print("Could not find save button - please save manually")
                                    input("Press Enter after saving manually...")
                            else:
                                print("Could not find edit button")
                                print("Please update manually:")
                                print(f"  Website: {config['website']}")
                                print(f"  Phone: {config['phone']}")
                                print(f"  Email: {config['email']}")
                                input("\nPress Enter when done...")

                            # Go back to main page
                            page.go_back()
                            time.sleep(2)

                        except Exception as e:
                            print(f"Error processing profile {idx}: {e}")
                            continue
                else:
                    print("\nNo business profiles found automatically.")
                    print("Please update profiles manually:")
                    print("\nXELORA:")
                    print(f"  Website: {XELORA_CONFIG['website']}")
                    print(f"  Phone: {XELORA_CONFIG['phone']}")
                    print(f"  Email: {XELORA_CONFIG['email']}")
                    print("\n3KPRO.SERVICES:")
                    print(f"  Website: {THREEKPRO_CONFIG['website']}")
                    print(f"  Phone: {THREEKPRO_CONFIG['phone']}")
                    print(f"  Email: {THREEKPRO_CONFIG['email']}")
                    print("\nBrowser will stay open for manual updates...")
                    input("\nPress Enter when all updates are complete...")

            except Exception as e:
                print(f"\nError finding profiles: {e}")
                print("\nPlease update profiles manually")
                print("Browser will stay open...")
                input("\nPress Enter when done...")

        except Exception as e:
            print(f"\nError: {e}")
            print("Taking error screenshot...")
            page.screenshot(path="error-screenshot.png")
            print("Screenshot saved: error-screenshot.png")

        finally:
            print("\n=== Automation Complete ===")
            print("Closing browser...")
            browser.close()

if __name__ == '__main__':
    main()
