import streamlit as st
import pandas as pd
import sys
import os
from datetime import datetime

# Add project root to path to allow importing from src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.engine.framework import STANDARD_FRAMEWORK
from src.engine.scorer import RiskScorer

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
    
    search = st.text_input("Search vendors...", "")
    
    vendors = get_mock_vendors()
    if search:
        vendors = [v for v in vendors if search.lower() in v['name'].lower()]
        
    for v in vendors:
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
                    
            if st.button(f"View Details {v['id']}"):
                st.session_state['selected_vendor'] = v
                
def page_new_assessment():
    st.title("New Assessment")
    st.write("Enter a vendor's Trust Center URL to begin automated scraping and analysis.")
    
    url = st.text_input("Trust Center URL", placeholder="https://trust.vendor.com")
    
    if st.button("Start Analysis"):
        with st.spinner("Scraping Trust Center..."):
            import time
            time.sleep(2) # Mock
        with st.spinner("Parsing Documents..."):
            time.sleep(1)
        with st.spinner("Calculating Risk Score..."):
            time.sleep(1)
            
        st.success("Analysis Complete!")
        st.json({
            "found_certs": ["SOC 2", "ISO 27001"],
            "risk_score": 88,
            "processed_docs": 3
        })
        
        # In a real app, this would save to DB and redirect.


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

# --- MAIN APP ---
def main():
    st.sidebar.title("🛡️ VendorScope")
    page = st.sidebar.radio("Navigation", ["Dashboard", "Vendor Directory", "Compare Vendors", "New Assessment"])
    st.sidebar.divider()
    st.sidebar.info("v0.1.0 Alpha")
    
    if page == "Dashboard":
        page_dashboard()
    elif page == "Vendor Directory":
        page_vendor_directory()
    elif page == "Compare Vendors":
        page_comparison()
    elif page == "New Assessment":
        page_new_assessment()

if __name__ == "__main__":
    main()
