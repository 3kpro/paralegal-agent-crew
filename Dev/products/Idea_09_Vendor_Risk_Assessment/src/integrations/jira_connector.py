import os
import logging
from typing import Optional, Dict
try:
    from jira import JIRA
except ImportError:
    JIRA = None

logger = logging.getLogger(__name__)

class JiraConnector:
    def __init__(self, server: str = None, email: str = None, api_token: str = None, project_key: str = "RISK"):
        self.server = server or os.getenv("JIRA_SERVER")
        self.email = email or os.getenv("JIRA_EMAIL")
        self.api_token = api_token or os.getenv("JIRA_API_TOKEN")
        self.project_key = project_key or os.getenv("JIRA_PROJECT_KEY", "RISK")
        self.client = None
        self._connect()

    def _connect(self):
        if not JIRA:
            logger.warning("JIRA library not installed.")
            return

        if self.server and self.email and self.api_token:
            try:
                self.client = JIRA(
                    server=self.server,
                    basic_auth=(self.email, self.api_token)
                )
                logger.info(f"Connected to Jira at {self.server}")
            except Exception as e:
                logger.error(f"Failed to connect to Jira: {e}")
        else:
            logger.warning("Jira credentials missing. Running in Mock mode.")

    def create_risk_ticket(self, summary: str, description: str, priority: str = "Medium") -> Optional[str]:
        """
        Creates a Jira ticket for a risk finding.
        Returns the issue key (e.g. RISK-123) or None if failed/mocked.
        """
        ticket_dict = {
            'project': {'key': self.project_key},
            'summary': summary,
            'description': description,
            'issuetype': {'name': 'Task'},
            'priority': {'name': priority},
        }

        if self.client:
            try:
                new_issue = self.client.create_issue(fields=ticket_dict)
                logger.info(f"Created Jira ticket: {new_issue.key}")
                return new_issue.key
            except Exception as e:
                logger.error(f"Error creating Jira ticket: {e}")
                return None
        else:
            logger.info(f"[MOCK] Would create Jira ticket: {summary} ({priority})")
            return f"MOCK-{self.project_key}-1"

    def get_ticket_status(self, issue_key: str) -> str:
        if self.client:
            try:
                issue = self.client.issue(issue_key)
                return issue.fields.status.name
            except Exception as e:
                logger.error(f"Error fetching ticket {issue_key}: {e}")
                return "Unknown"
        else:
            return "Open"
