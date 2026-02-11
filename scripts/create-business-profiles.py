#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create Google Business Profiles for 3kpro.services and XELORA
"""

import sys
import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Business data
BUSINESSES = [
    {
        'name': '3K Pro Services',
        'category': 'Software company',
        'website': 'https://3kpro.services',
        'phone': '918-816-8832',
        'email': 'james@3kpro.services',
        'description': '3K Pro Services delivers precision-engineered SaaS solutions and digital infrastructure for modern businesses. We specialize in full-stack development, cloud architecture, and AI-powered business tools.',
        'location': 'Tulsa, Oklahoma',
        'service_area': True,  # No physical address
    },
    {
        'name': 'XELORA',
        'category': 'Software company',
        'website': 'https://getxelora.com',
        'phone': '918-816-8832',
        'email': 'support@3kpro.services',
        'description': 'XELORA is an AI-powered SaaS platform that predicts content performance before you publish. Get real-time recommendations and optimize your content strategy with advanced machine learning insights.',
        'online_only': True,
    }
]

def create_profile(page, business):
    """Create a single business profile"""
    print(f"\n=== Creating profile for {business['name']} ===")

    try:
        # Click "Start now" button
        print("Clicking 'Start now'...")
        start_button = page.locator('button:has-text("Start now"), a:has-text("Start now")').first
        start_button.click(timeout=10000)
        time.sleep(3)

        # Enter business name
        print(f"Entering business name: {business['name']}")
        name_input = page.locator('input[name="business-name"], input[placeholder*="business name"], input[aria-label*="business name"]').first
        name_input.fill(business['name'])
        time.sleep(1)

        # Click Next/Continue
        next_button = page.locator('button:has-text("Next"), button:has-text("Continue")').first
        next_button.click(timeout=10000)
        time.sleep(3)

        # Select category
        print(f"Selecting category: {business['category']}")
        category_input = page.locator('input[placeholder*="category"], input[aria-label*="category"]').first
        category_input.fill(business['category'])
        time.sleep(2)

        # Click on first suggestion if available
        suggestion = page.locator('[role="option"], [data-suggestion]').first
        if suggestion.is_visible():
            suggestion.click()
            time.sleep(1)

        # Click Next
        next_button = page.locator('button:has-text("Next"), button:has-text("Continue")').first
        next_button.click(timeout=10000)
        time.sleep(3)

        # Handle location/address
        if business.get('service_area') or business.get('online_only'):
            print("Selecting service area / no physical location...")
            # Look for "I don't have a physical location" or similar
            no_location = page.locator('text="I don\'t have a location", text="No physical location", text="Service-area business"').first
            if no_location.is_visible():
                no_location.click()
                time.sleep(2)

        if business.get('location'):
            print(f"Entering service area: {business['location']}")
            location_input = page.locator('input[placeholder*="location"], input[placeholder*="address"], input[aria-label*="address"]').first
            location_input.fill(business['location'])
            time.sleep(2)

            # Select first suggestion
            suggestion = page.locator('[role="option"]').first
            if suggestion.is_visible():
                suggestion.click()
                time.sleep(1)

        # Click Next
        next_button = page.locator('button:has-text("Next"), button:has-text("Continue")').first
        next_button.click(timeout=10000)
        time.sleep(3)

        # Add contact information
        print(f"Adding phone: {business['phone']}")
        phone_input = page.locator('input[type="tel"], input[name*="phone"], input[aria-label*="phone"]').first
        phone_input.fill(business['phone'])
        time.sleep(1)

        print(f"Adding website: {business['website']}")
        website_input = page.locator('input[type="url"], input[name*="website"], input[aria-label*="website"]').first
        website_input.fill(business['website'])
        time.sleep(1)

        # Click Next/Finish
        finish_button = page.locator('button:has-text("Finish"), button:has-text("Next"), button:has-text("Continue")').first
        finish_button.click(timeout=10000)
        time.sleep(3)

        # Add description if there's a field
        try:
            desc_input = page.locator('textarea[name*="description"], textarea[aria-label*="description"]').first
            if desc_input.is_visible(timeout=5000):
                print("Adding business description...")
                desc_input.fill(business['description'])
                time.sleep(1)

                # Save
                save_button = page.locator('button:has-text("Save"), button:has-text("Next")').first
                save_button.click(timeout=10000)
                time.sleep(2)
        except:
            pass

        print(f"✓ Profile created for {business['name']}")
        page.screenshot(path=f"profile-created-{business['name'].replace(' ', '-').lower()}.png")

        return True

    except Exception as e:
        print(f"✗ Error creating profile for {business['name']}: {e}")
        page.screenshot(path=f"error-{business['name'].replace(' ', '-').lower()}.png")
        return False

def main():
    print("=== Google Business Profile Creator ===")

    with sync_playwright() as p:
        # Launch browser (non-headless for user interaction if needed)
        browser = p.chromium.launch(headless=False, slow_mo=1000)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to Google Business Profile
            print("\nNavigating to business.google.com...")
            page.goto("https://business.google.com/create", timeout=60000)
            time.sleep(3)

            # Check if already signed in
            if page.locator('text="Sign in"').is_visible():
                print("\nWaiting for sign-in...")
                page.wait_for_url('**/business.google.com/**', timeout=300000)
                time.sleep(3)

            # Create profiles
            for business in BUSINESSES:
                success = create_profile(page, business)

                if success:
                    # Navigate back to create another
                    if business != BUSINESSES[-1]:
                        print("\nNavigating to create next profile...")
                        page.goto("https://business.google.com/create", timeout=60000)
                        time.sleep(3)

                time.sleep(2)

            print("\n=== All profiles created! ===")
            print("\nBrowser will stay open for 30 seconds for you to review...")
            time.sleep(30)

        except Exception as e:
            print(f"\nError: {e}")
            page.screenshot(path="creation-error.png")
            print("\nBrowser will stay open for review...")
            time.sleep(60)

        finally:
            browser.close()

if __name__ == '__main__':
    main()
