import streamlit as st
import pandas as pd
import sys
import os
from datetime import datetime

# Add project root to path to allow importing from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.engine.framework import STANDARD_FRAMEWORK
from src.engine.scorer import RiskScorer
from src.monitoring.logger import setup_monitoring
from src.security.audit_logger import AuditLogger
from src.notifications.service import NotificationService
from src.models.notification import NotificationType
from src.reporting.generator import ReportGenerator

# Initialize Monitoring
logger = setup_monitoring()

# Page Config
st.set_page_config(
    page_title="VendorScope - Risk Assessment",
    page_icon="🛡️",
    layout="wide"
)

# --- MOCK DATA SERVICE ---
def get_mock_vendors():
    return [
        {
            "id": 1,
            "name": "Acme SaaS Corp",
            "domain": "acme.com",
            "score": 85,
            "certs": ["SOC 2 Type II", "ISO 27001", "GDPR"],
            "last_assessed": "2026-01-10"
        },
        {
            "id": 2,
            "name": "CloudNine Storage",
            "domain": "cloud9.io",
            "score": 45,
            "certs": ["GDPR"],
            "last_assessed": "2026-01-08"
        },
        {
            "id": 3,
            "name": "SecureAuth Provider",
            "domain": "auth.net",
            "score": 92,
            "certs": ["SOC 2", "ISO 27001", "FedRAMP", "HIPAA"],
            "last_assessed": "2026-01-11"
        }
    ]

# --- UI COMPONENTS ---


def page_dashboard():
    st.title("Executive Overview")
    
    col1, col2, col3 = st.columns(3)
    vendors = get_mock_vendors()
    
    avg_score = sum(v['score'] for v in vendors) / len(vendors)
    
    with col1:
        st.metric("Monitored Vendors", len(vendors), "+1 this week")
    with col2:
        st.metric("Avg Security Score", f"{avg_score:.1f}", "+2.4%")
    with col3:
        st.metric("Pending Assessments", "2", "-1")

    st.subheader("Recent Assessments")
    df = pd.DataFrame(vendors)
    st.dataframe(df.style.highlight_between("score", left=0, right=60, color="#ffdddd"), use_container_width=True)

def page_vendor_directory():
    st.title("Vendor Directory")
    
    # --- Sidebar Filters ---
    st.sidebar.header("Filter Vendors")
    
    # 1. Search
    search = st.text_input("Search vendors...", "")
    
    # 2. Score Range
    min_score, max_score = st.sidebar.slider("Security Score Range", 0, 100, (0, 100))
    
    # 3. Status Filter (Derived from Score)
    status_filter = st.sidebar.multiselect(
        "Risk Status",
        options=["Low Risk", "Medium Risk", "High Risk"],
        default=[]
    )
    
    # 4. Certification Filter
    # Get all unique certs
    all_vendors = get_mock_vendors()
    all_certs = set(cert for v in all_vendors for cert in v['certs'])
    cert_filter = st.sidebar.multiselect("Certifications", options=list(all_certs))

    # --- Apply Filters ---
    filtered_vendors = []
    
    for v in all_vendors:
        # Search
        if search and search.lower() not in v['name'].lower() and search.lower() not in v['domain'].lower():
            continue
            
        # Score
        if not (min_score <= v['score'] <= max_score):
            continue
            
        # Certs (Match ANY selected)
        if cert_filter and not any(c in v['certs'] for c in cert_filter):
            continue
            
        # Status
        risk_status = "High Risk"
        if v['score'] > 80: risk_status = "Low Risk"
        elif v['score'] > 50: risk_status = "Medium Risk"
        
        if status_filter and risk_status not in status_filter:
            continue
            
        filtered_vendors.append(v)
    
    # --- Display ---
    st.write(f"Showing {len(filtered_vendors)} of {len(all_vendors)} vendors")
    
    if not filtered_vendors:
        st.info("No vendors match your filters.")
        return

    for v in filtered_vendors:
        with st.expander(f"{v['name']} ({v['domain']}) - Score: {v['score']}"):
            c1, c2 = st.columns([1, 1])
            with c1:
                st.write("**Certifications:**")
                for cert in v['certs']:
                    st.caption(f"✅ {cert}")
            with c2:
                st.write("**Risk Analysis:**")
                st.progress(v['score'] / 100)
                if v['score'] > 80:
                    st.success("Low Risk")
                elif v['score'] > 50:
                    st.warning("Medium Risk")
                else:
                    st.error("High Risk")
                    
            c_btn1, c_btn2 = st.columns([1, 1])
            with c_btn1:
                if st.button(f"View Details {v['id']}"):
                    st.session_state['selected_vendor'] = v
            with c_btn2:
                if st.button(f"📄 Generate Report", key=f"rep_{v['id']}"):
                    with st.spinner("Generating PDF..."):
                        gen = ReportGenerator()
                        # Mock Assessment Data
                        assess_data = {
                            "score": v['score'],
                            "date": v['last_assessed'],
                            "id": f"ASM-{v['id']}-2026",
                            "findings": [
                                {"severity": "HIGH", "issue": "Missing Penetration Test"},
                                {"severity": "MEDIUM", "issue": "Old Privacy Policy"}
                            ] if v['score'] < 80 else []
                        }
                        path = gen.generate_report(v, assess_data)
                        
                        with open(path, "rb") as f:
                            pdf_bytes = f.read()
                        
                        st.download_button(
                            label="Download PDF",
                            data=pdf_bytes,
                            file_name=os.path.basename(path),
                            mime="application/pdf",
                            key=f"dl_{v['id']}"
                        )
                        
                        # Audit
                        user_id = st.session_state.get("username_id", "unknown")
                        AuditLogger.log_event("DOWNLOAD_REPORT", user_id, "mock-org-1", f"Vendor: {v['name']}")
                
def page_new_assessment():
    st.title("New Assessment")
    st.write("Enter a vendor's Trust Center URL to begin automated scraping and analysis.")
    
    url = st.text_input("Trust Center URL", placeholder="https://trust.vendor.com")
    
    if st.button("Start Analysis"):
        # Mock Context
        user_id = st.session_state.get("username_id", "unknown")
        
        with st.spinner("Scraping Trust Center..."):
            import time
            time.sleep(2) # Mock
        with st.spinner("Parsing Documents..."):
            time.sleep(1)
        with st.spinner("Calculating Risk Score & AI Mitigations..."):
            # Real logic simulation
            scorer = RiskScorer(use_ai=True)
            # simulate some certs
            res = scorer.evaluate(certs=["SOC 2"], text_corpus="We use AES-256 for encryption but do not have ISO 27001.")
            time.sleep(2)
            
        st.success("Analysis Complete!")
        
        c1, c2 = st.columns([1, 1])
        with c1:
            st.metric("Security Score", res.total_score)
            st.progress(res.total_score / 100)
        
        with c2:
            st.write("**Findings & AI Mitigations**")
            for finding in res.details:
                if not finding.is_satisfied:
                    with st.expander(f"❌ {finding.control_id} - Mitigation Required"):
                        st.warning(finding.mitigation_plan)
                else:
                    st.caption(f"✅ {finding.control_id} - Satisfied")

        # AUDIT LOG
        AuditLogger.log_event("START_ASSESSMENT", user_id, "mock-org-1", f"URL: {url}")
        
        # NOTIFICATION
        NotificationService.send(
            title="Assessment Complete",
            message=f"Analysis for {url} finished with score 88.",
            user_id=user_id,
            org_id="mock-org-1",
            type=NotificationType.SUCCESS
        )


def page_comparison():
    st.title("Vendor Comparison")
    
    vendors = get_mock_vendors()
    vendor_names = [v['name'] for v in vendors]
    
    selected_names = st.multiselect(
        "Select vendors to compare (max 3)",
        options=vendor_names,
        max_selections=3,
        default=vendor_names[:2]
    )
    
    if not selected_names:
        st.info("Select at least one vendor to compare.")
        return
        
    cols = st.columns(len(selected_names))
    
    selected_vendors = [v for v in vendors if v['name'] in selected_names]
    
    for idx, v in enumerate(selected_vendors):
        with cols[idx]:
            st.subheader(v['name'])
            st.caption(v['domain'])
            st.divider()
            
            # Score
            st.metric("Security Score", v['score'])
            st.progress(v['score'] / 100)
            
            st.divider()
            
            # Certs
            st.write("**Certifications**")
            for cert in v['certs']:
                st.info(f"✅ {cert}")
                
            if not v['certs']:
                st.warning("No certifications found.")
                
            st.divider()
            st.caption(f"Last Assessed: {v['last_assessed']}")

def page_framework_builder():
    st.title("Custom Framework Builder 🛠️")
    st.write("Define your own risk assessment framework by adding controls below.")

    with st.expander("Framework Details", expanded=True):
        f_name = st.text_input("Framework Name", placeholder="e.g. Fintech Compliance v1")
        f_version = st.text_input("Version", value="1.0")

    st.subheader("Controls Definition")
    
    # Initialize session state for controls if not present
    if 'custom_controls' not in st.session_state:
        st.session_state['custom_controls'] = [
            {"id": "C-01", "name": "Example Control", "description": "Description here...", "weight": 10.0, "keywords": "security, compliance"}
        ]

    # Data Editor for interactive table
    edited_controls = st.data_editor(
        st.session_state['custom_controls'],
        num_rows="dynamic",
        column_config={
            "id": st.column_config.TextColumn("Control ID", required=True),
            "name": st.column_config.TextColumn("Control Name", required=True),
            "description": st.column_config.TextColumn("Description", width="large"),
            "weight": st.column_config.NumberColumn("Weight (pts)", min_value=0, max_value=100, default=5.0),
            "keywords": st.column_config.TextColumn("Keywords (comma separated)")
        },
        use_container_width=True,
        key="editor_controls"
    )
    
    # Update Session State immediately so edits aren't lost on rerun
    # Note: st.data_editor works on a copy, so we must manually sync if we want persistent state outside of the editor
    # But since we assign edited_controls back on Save, we are good.
    # However, to support adding rows and keeping them, we need to respect the return value.
    if edited_controls != st.session_state['custom_controls']:
        st.session_state['custom_controls'] = edited_controls

    if st.button("Save Framework"):
        if not f_name:
            st.error("Please provide a Framework Name.")
            return
        
        # Mock Save
        st.success(f"Framework '{f_name} v{f_version}' saved successfully with {len(edited_controls)} controls!")
        
        # AUDIT LOG
        user_id = st.session_state.get("username_id", "unknown")
        AuditLogger.log_event("CREATE_FRAMEWORK", user_id, "mock-org-1", f"Framework: {f_name} v{f_version}")
        
        # NOTIFICATION
        NotificationService.send(
            title="New Framework Created",
            message=f"Framework '{f_name}' was created by {user_id}.",
            user_id=None, # Broadcast
            org_id="mock-org-1",
            type=NotificationType.INFO
        )
        
        st.json({
            "name": f_name,
            "version": f_version,
            "controls": edited_controls
        })

def page_contracts():
    st.title("Contract Management 📜")
    
    # Mock Data for Contracts
    contracts_data = [
        {"id": "CON-001", "vendor": "Acme SaaS Corp", "title": "Enterprise Subscription", "value": 12000, "end_date": "2026-06-30", "status": "ACTIVE"},
        {"id": "CON-002", "vendor": "CloudNine Storage", "title": "Storage Add-on", "value": 5000, "end_date": "2025-12-31", "status": "EXPIRED"},
        {"id": "CON-003", "vendor": "SecureAuth Provider", "title": "Identity Platform", "value": 45000, "end_date": "2026-02-15", "status": "RENEWAL_DUE"},
    ]
    
    # DF for display
    df = pd.DataFrame(contracts_data)
    
    # Metric Summary
    c1, c2, c3 = st.columns(3)
    active_value = df[df['status'] == 'ACTIVE']['value'].sum()
    renewal_count = len(df[df['status'] == 'RENEWAL_DUE'])
    
    with c1:
        st.metric("Briefcase Value (Annual)", f"${active_value:,.0f}")
    with c2:
        st.metric("Renewals Due", renewal_count, outcome="inverse")
    with c3:
        st.metric("Total Contracts", len(df))

    st.divider()
    
    st.subheader("Active Agreements")
    
    # Custom coloring for status
    def highlight_status(val):
        color = 'green' if val == 'ACTIVE' else 'red' if val == 'EXPIRED' else 'orange'
        return f'color: {color}; font-weight: bold'

    st.dataframe(
        df.style.map(highlight_status, subset=['status']),
        use_container_width=True,
        column_config={
            "value": st.column_config.NumberColumn("Annual Value", format="$%d"),
            "end_date": st.column_config.DateColumn("Expiration Date")
        }
    )
    
    st.caption("Auto-generated notifications sent to owners for 'RENEWAL_DUE' items.")

def page_data_manager():
    st.title("Data Manager 📤")
    
    st.info("Export or Import your vendor/assessment data for backup or migration.")
    
    tab1, tab2 = st.tabs(["Export Data", "Import Data"])
    
    # --- EXPORT ---
    with tab1:
        st.subheader("Export Data")
        
        # Mock Data
        vendors = get_mock_vendors()
        df = pd.DataFrame(vendors)
        
        # Convert to CSV
        csv = df.to_csv(index=False).encode('utf-8')
        
        if st.download_button(
            label="Download Vendors as CSV",
            data=csv,
            file_name='vendors_export.csv',
            mime='text/csv',
        ):
            user_id = st.session_state.get("username_id", "unknown")
            AuditLogger.log_event("EXPORT_DATA", user_id, "mock-org-1", "Format: CSV")
        
        # Convert to JSON
        json_str = df.to_json(orient="records")
        if st.download_button(
            label="Download Vendors as JSON",
            data=json_str,
            file_name='vendors_export.json',
            mime='application/json',
        ):
            user_id = st.session_state.get("username_id", "unknown")
            AuditLogger.log_event("EXPORT_DATA", user_id, "mock-org-1", "Format: JSON")
        
    # --- IMPORT ---
    with tab2:
        st.subheader("Import Data")
        
        uploaded_file = st.file_uploader("Choose a file (CSV or JSON)", type=['csv', 'json'])
        
        if uploaded_file is not None:
            try:
                if uploaded_file.name.endswith('.csv'):
                    df_import = pd.read_csv(uploaded_file)
                    st.success("CSV loaded successfully!")
                else:
                    df_import = pd.read_json(uploaded_file)
                    st.success("JSON loaded successfully!")
                    
                st.dataframe(df_import)
                
                if st.button("Confirm Import to Database"):
                    user_id = st.session_state.get("username_id", "unknown")
                    AuditLogger.log_event("IMPORT_DATA", user_id, "mock-org-1", f"Rows: {len(df_import)}")
                    st.toast(f"Successfully imported {len(df_import)} records!", icon="✅")
            except Exception as e:
                st.error(f"Error reading file: {e}")


def page_question_bank():
    st.title("Security Question Bank 🔒")
    st.write("Manage standard security questions and answer guidance.")
    
    # Initialize session state for questions
    if 'questions_bank' not in st.session_state:
        st.session_state['questions_bank'] = [
            {"id": "Q-001", "text": "Do you encrypt data at rest?", "category": "Encryption", "guidance": "Look for mentions of AES-256, disk encryption, or AWS KMS."},
            {"id": "Q-002", "text": "Do you conduct annual penetration testing?", "category": "Vulnerability Management", "guidance": "Check for 'annual', 'third-party', or 'pentest' reports."},
            {"id": "Q-003", "text": "Is Multi-Factor Authentication (MFA) enforced?", "category": "Access Control", "guidance": "Look for MFA, 2FA, or Duo/Okta enforcement policies."}
        ]
        
    # Editor
    edited_questions = st.data_editor(
        st.session_state['questions_bank'],
        num_rows="dynamic",
        column_config={
            "id": "ID",
            "text": st.column_config.TextColumn("Question Text", width="large"),
            "category": "Category",
            "guidance": st.column_config.TextColumn("AI Guidance", width="medium")
        },
        use_container_width=True
    )
    
    if st.button("Save Question Bank"):
        st.session_state['questions_bank'] = edited_questions
        st.success(f"Saved {len(edited_questions)} questions to the bank.")
        
        # AUDIT LOG
        user_id = st.session_state.get("username_id", "unknown")
        AuditLogger.log_event("UPDATE_QUESTION_BANK", user_id, "mock-org-1", f"Count: {len(edited_questions)}")
        
        st.toast("Question Bank Updated", icon="💾")

def page_analytics():
    st.title("Advanced Analytics 📈")
    
    st.write("Historical analysis of vendor risk and portfolio health.")
    
    # Mock Historical Data
    dates = pd.date_range(start="2025-01-01", periods=12, freq="M")
    
    history_data = {
        "Date": dates,
        "Average Risk Score": [78, 79, 75, 76, 80, 82, 81, 83, 85, 84, 86, 85],
        "High Risk Vendors": [2, 3, 3, 2, 2, 1, 1, 1, 0, 1, 1, 1]
    }
    df_history = pd.DataFrame(history_data)
    df_history.set_index("Date", inplace=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Risk Score Trend")
        st.line_chart(df_history["Average Risk Score"], color="#2ecc71") # Green
        
    with col2:
        st.subheader("High Risk Vendor Count")
        st.bar_chart(df_history["High Risk Vendors"], color="#e74c3c") # Red
        
    st.divider()
    
    st.subheader("Portfolio Distribution by Category")
    
    # Mock Category Data
    cat_data = pd.DataFrame({
        "Category": ["SaaS", "Infrastructure", "Marketing", "HR", "Security"],
        "Count": [15, 5, 8, 4, 3]
    })
    
    st.bar_chart(cat_data.set_index("Category"))
    
    st.info("💡 Insight: Risk scores have improved by 7% over the last year due to stricter onboarding policies.")
    
    if st.button("Generate Detailed Report (PDF)"):
        st.toast("Generating full portfolio report...", icon="📄")
        # In real app, this would call ReportGenerator for portfolio-wide stats

def page_notifications():
    st.title("Notification Center 🔔")
    
    user_id = st.session_state.get("username_id", "unknown")
    org_id = "mock-org-1"
    
    # Actions
    c1, c2 = st.columns([1, 5])
    with c1:
        if st.button("Mark All Read"):
            NotificationService.mark_all_read(user_id)
            st.rerun()
            
    # List
    notifications = NotificationService.get_for_user(user_id, org_id)
    
    if not notifications:
        st.info("No notifications.")
        return
        
    for n in notifications:
        # Style based on type
        icon = "ℹ️"
        if n['type'] == "WARNING": icon = "⚠️"
        elif n['type'] == "ALERT": icon = "🚨"
        elif n['type'] == "SUCCESS": icon = "✅"
        
        with st.chat_message("assistant", avatar=icon):
            c_header, c_time = st.columns([4, 1])
            with c_header:
                st.markdown(f"**{n['title']}**")
            with c_time:
                st.caption(n['created_at'][:16].replace("T", " "))
            
            st.write(n['message'])
            if n.get('link'):
                st.markdown(f"[View Details]({n['link']})")
                
            if not n['is_read']:
                if st.button("Mark Read", key=n['id']):
                    NotificationService.mark_read(n['id'])
                    st.rerun()
            else:
                st.caption("Read")

from auth import check_password, check_token_login
from src.models.user import UserRole

def page_vendor_portal():
    st.title("Partner Portal 🌐")
    st.info("Welcome! Please upload the requested compliance documents to speed up your assessment.")
    
    st.subheader("Required Documents")
    
    # Mock Document Check list
    docs = [
        {"name": "SOC 2 Type II Report", "status": "Missing"},
        {"name": "ISO 27001 Certificate", "status": "Uploaded"},
        {"name": "Penetration Test Summary", "status": "Missing"}
    ]
    
    for doc in docs:
        c1, c2, c3 = st.columns([2, 1, 1])
        with c1:
            st.write(f"**{doc['name']}**")
        with c2:
            if doc['status'] == "Missing":
                st.caption("❌ Missing")
            else:
                st.caption("✅ Uploaded")
        with c3:
            if doc['status'] == "Missing":
                st.file_uploader(f"Upload {doc['name']}", key=doc['name'], label_visibility="collapsed")
    
    st.divider()
    if st.button("Submit Documents for Review"):
        st.success("Documents submitted! Our team will review them shortly.")
        
        # Audit Log
        user_id = st.session_state.get("username_id", "unknown")
        AuditLogger.log_event("VENDOR_UPLOAD", user_id, "mock-org-1", "Files uploaded via Portal")

# --- MAIN APP ---
def main():
    # 1. Check for Vendor Invite Token
    if check_token_login():
        pass # Logged in as Vendor
    
    # 2. Regular Login
    elif not check_password():
        st.stop()

    # Get Role
    role = st.session_state.get("user_role", UserRole.VIEWER)
    user_name = st.session_state.get("user_name", "User")
    
    # --- SPECIAL VENDOR VIEW ---
    if role == "VENDOR":
        st.sidebar.title("Partner Access")
        st.sidebar.caption(f"ID: {user_name}")
        page_vendor_portal()
        return
    # ---------------------------

    user_id = st.session_state.get("username_id", "unknown")
    org_id = "mock-org-1"
    
    # Notifications Count
    unread_count = len([n for n in NotificationService.get_for_user(user_id, org_id) if not n['is_read']])
    nav_badge = f" :red[{unread_count}]" if unread_count > 0 else ""
    
    st.sidebar.title("🛡️ VendorScope")
    st.sidebar.caption(f"Logged in as: {user_name} ({role.value})")
    
    # Rest of the app
    if st.sidebar.button("Logout"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

    # RBAC Navigation
    nav_options = ["Dashboard", f"Notifications{nav_badge}", "Vendor Directory", "Compare Vendors"]
    
    if role in [UserRole.ADMIN, UserRole.EDITOR]:
        nav_options.extend(["New Assessment", "Framework Builder", "Security Question Bank"])
        
    if role == UserRole.ADMIN:
        nav_options.extend(["Contract Management", "Data Manager", "Advanced Analytics"])
        
    if role == UserRole.AUDITOR:
        nav_options.append("Advanced Analytics")

    page = st.sidebar.radio("Navigation", nav_options)
    st.sidebar.divider()
    st.sidebar.info("v1.1.0 (RBAC Enabled)")
    
    # Normalize page name (remove badge)
    page_clean = page.split(" :")[0]
    
    if page_clean == "Dashboard":
        page_dashboard()
    elif page_clean == "Notifications":
        page_notifications()
    elif page_clean == "Vendor Directory":
        page_vendor_directory()
    elif page_clean == "Compare Vendors":
        page_comparison()
    elif page_clean == "New Assessment":
        page_new_assessment()
    elif page_clean == "Framework Builder":
        page_framework_builder()
    elif page_clean == "Contract Management":
        page_contracts()
    elif page_clean == "Data Manager":
        page_data_manager()
    elif page_clean == "Advanced Analytics":
        page_analytics()
    elif page_clean == "Security Question Bank":
        page_question_bank()

if __name__ == "__main__":
    main()
