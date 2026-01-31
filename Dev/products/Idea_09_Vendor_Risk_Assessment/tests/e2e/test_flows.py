import re
from playwright.sync_api import Page, expect

def test_login_flow(page: Page):
    """
    Test that a use can login to the dashboard.
    Assumes the app is running (e.g. locally or in CI).
    """
    # 1. Navigate to the app (using localhost:8501 for Streamlit default)
    # Note: In a real CI environment, you'd use a base_url fixture.
    page.goto("http://localhost:8501")
    
    # 2. Check if we are on the Login page
    # Streamlit creates inputs with specific attributes, we might need to rely on labels or placeholders
    # In Streamlit, wait for the first element to render
    page.wait_for_selector('input[aria-label="Username (admin, editor, viewer, auditor)"]')
    
    # 3. Enter Credentials
    page.get_by_label("Username (admin, editor, viewer, auditor)").fill("admin")
    page.get_by_label("Password (default: password)").fill("password")
    
    # 4. Click Login
    page.get_by_role("button", name="Login").click()
    
    # 5. Verify Success
    # Should see the dashboard title "Executive Overview"
    # Streamlit reloads, so we might need to wait for the new element
    expect(page.get_by_text("Executive Overview")).to_be_visible(timeout=10000)
    expect(page.get_by_text("Logged in as: Admin User (ADMIN)")).to_be_visible()

def test_new_assessment_flow(page: Page):
    """
    Test starting a new assessment (Admin/Editor only).
    """
    # Pre-req: Login (In Playwright we can reuse state or just re-login reasonably fast)
    page.goto("http://localhost:8501")
    
    # Login again if not persisted (Streamlit session usually resets on page reload if not saving cookies)
    # Wait for either Executive Overview OR Login inputs
    try:
        expect(page.get_by_text("Executive Overview")).to_be_visible(timeout=2000)
    except:
        # Not logged in
        page.get_by_label("Username (admin, editor, viewer, auditor)").fill("admin")
        page.get_by_label("Password (default: password)").fill("password")
        page.get_by_role("button", name="Login").click()
        expect(page.get_by_text("Executive Overview")).to_be_visible(timeout=10000)
    
    # Navigate to "New Assessment" via Sidebar
    # Streamlit sidebar navigation uses radio buttons
    page.get_by_text("New Assessment").click()
    
    # Verify Page Title
    expect(page.get_by_role("heading", name="New Assessment")).to_be_visible()
    
    # Enter URL
    page.get_by_placeholder("https://trust.vendor.com").fill("https://trust.params.com")
    
    # Click Start
    page.get_by_role("button", name="Start Analysis").click()
    
    # Expect Success
    # It shows spinners then "Analysis Complete!"
    expect(page.get_by_text("Analysis Complete!")).to_be_visible(timeout=15000)
    
    # Verify Mock Results
    expect(page.get_by_text("risk_score")).to_be_visible()

def test_data_export(page: Page):
    """
    Test Admin capability to export data.
    """
    page.goto("http://localhost:8501")
    
    # Login
    # Login
    try:
        expect(page.get_by_text("Executive Overview")).to_be_visible(timeout=2000)
    except:
        page.get_by_label("Username (admin, editor, viewer, auditor)").fill("admin")
        page.get_by_label("Password (default: password)").fill("password")
        page.get_by_role("button", name="Login").click()
        expect(page.get_by_text("Executive Overview")).to_be_visible(timeout=10000)

    # Navigate to Data Manager
    page.get_by_text("Data Manager").click()
    
    expect(page.get_by_role("heading", name="Data Manager 📤")).to_be_visible()
    
    # Test CSV Download
    # In Playwright, we wait for the download event
    with page.expect_download() as download_info:
        page.get_by_role("button", name="Download Vendors as CSV").click()
    
    download = download_info.value
    assert download.suggested_filename == "vendors_export.csv"
