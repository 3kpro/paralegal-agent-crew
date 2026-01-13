from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class RiskControl:
    id: str
    name: str
    description: str
    weight: float  # Importance (0.0 to 1.0) or points
    keywords: List[str]  # Simple keyword matching for MVP

@dataclass
class RiskFramework:
    name: str
    version: str
    controls: List[RiskControl]

# MVP Standard Framework (Simplified Lite-VRA)
STANDARD_FRAMEWORK = RiskFramework(
    name="Standard Vendor Assessment Framework v1.0",
    version="1.0",
    controls=[
        RiskControl(
            id="SEC-01",
            name="SOC 2 Compliance",
            description="Vendor has valid SOC 2 Type II attestation.",
            weight=20.0,
            keywords=["SOC 2", "SOC2", "AICPA"]
        ),
        RiskControl(
            id="SEC-02",
            name="ISO 27001 Certification",
            description="Vendor is ISO 27001 certified.",
            weight=15.0,
            keywords=["ISO 27001", "ISO27001"]
        ),
        RiskControl(
            id="SEC-03",
            name="Data Encryption",
            description="Data is encrypted at rest and in transit.",
            weight=10.0,
            keywords=["encryption", "AES-256", "TLS", "at rest", "in transit"]
        ),
        RiskControl(
            id="SEC-04",
            name="Access Control & SSO",
            description="Supports SSO/MFA for access.",
            weight=10.0,
            keywords=["SSO", "SAML", "MFA", "Multi-factor"]
        ),
        RiskControl(
            id="PRV-01",
            name="GDPR Compliance",
            description="Vendor adheres to GDPR requirements.",
            weight=10.0,
            keywords=["GDPR", "DPA", "Data Processing Agreement"]
        )
    ]
)
