import streamlit as st
import os

from datetime import datetime
from src.models.user import UserRole
import time

# Mock Users Database
MOCK_USERS = {
    "admin": {"role": UserRole.ADMIN, "name": "Admin User"},
    "editor": {"role": UserRole.EDITOR, "name": "Editor User"},
    "viewer": {"role": UserRole.VIEWER, "name": "Viewer User"},
    "auditor": {"role": UserRole.AUDITOR, "name": "Auditor User"}
}

def check_password():
    """Returns `True` if the user had the correct password."""

    def login_clicked():
        """Checks whether a password entered by the user is correct."""
        username = st.session_state["username"]
        password = st.session_state["password"]
        
        # Simple Mock Auth: Password is 'password' for everyone, or environment variable
        env_pass = os.getenv("DASHBOARD_PASSWORD", "password")
        
        if password == env_pass and username in MOCK_USERS:
            user_data = MOCK_USERS[username]
            st.session_state["password_correct"] = True
            st.session_state["user_role"] = user_data["role"]
            st.session_state["user_name"] = user_data["name"]
            st.session_state["username_id"] = username
            
            # Clear credentials
            st.session_state["password"] = "" 
        else:
            st.session_state["password_correct"] = False

    if "password_correct" not in st.session_state:
        # First run, show input for password.
        st.markdown("### Login")
        st.text_input("Username (admin, editor, viewer, auditor)", key="username")
        st.text_input("Password (default: password)", type="password", key="password")
        st.button("Login", on_click=login_clicked)
        return False
        
    elif not st.session_state["password_correct"]:
        # Password not correct, show input + error.
        st.markdown("### Login")
        st.text_input("Username (admin, editor, viewer, auditor)", key="username")
        st.text_input("Password", type="password", key="password")
        st.button("Login", on_click=login_clicked)
        st.error("😕 User not found or password incorrect")
        return False
        
    else:
        # Password correct.
        return True

def check_token_login():
    """
    Checks for 'token' in query parameters. 
    If present and valid, logs in as VENDOR.
    """
    try:
        query_params = st.query_params
        token = query_params.get("token")
        
        if token:
            # In a real DB, we would query Invitation model
            # For Mock, we accept any token starting with 'inv-'
            if str(token).startswith("inv-"):
                st.session_state["password_correct"] = True
                st.session_state["user_role"] = "VENDOR" # Special role
                st.session_state["user_name"] = "Invited Vendor"
                st.session_state["username_id"] = f"vendor-{token}"
                return True
            else:
                st.error("Invalid Invitation Token")
                return False
    except Exception:
        pass
        
    return False
