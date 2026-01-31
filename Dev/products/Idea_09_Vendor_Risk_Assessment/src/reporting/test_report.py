import sys
import os

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.reporting.generator import ReportGenerator

def test_pdf_generation():
    generator = ReportGenerator(output_dir="dist/reports_test")
    
    vendor_data = {
        "name": "Acme Corp",
        "domain": "acme.com",
        "certs": ["SOC 2 Type II", "ISO 27001"]
    }
    
    assessment_data = {
        "id": "ASM-12345",
        "score": 75,
        "findings": [
            {"severity": "HIGH", "issue": "Missing Penetration Test Report (older than 12 months)."},
            {"severity": "MEDIUM", "issue": "Privacy Policy does not mention GDPR specifics."},
            {"severity": "LOW", "issue": "Cookie banner is ambiguous."}
        ]
    }
    
    print("\n[1] Generating PDF Report...")
    path = generator.generate_report(vendor_data, assessment_data, filename="Test_Report.pdf")
    
    print(f"Report generated at: {path}")
    
    if os.path.exists(path):
        print("SUCCESS: File exists.")
    else:
        print("FAILURE: File not found.")

if __name__ == "__main__":
    test_pdf_generation()
