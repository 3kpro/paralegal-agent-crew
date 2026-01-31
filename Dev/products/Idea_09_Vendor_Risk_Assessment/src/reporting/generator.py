import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import Dict, Any, List

class ReportGenerator:
    def __init__(self, output_dir: str = "dist/reports"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1 # Center
        ))
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=15,
            spaceAfter=10,
            textColor=colors.HexColor('#2c3e50')
        ))
        self.styles.add(ParagraphStyle(
            name='RiskHigh',
            parent=self.styles['Normal'],
            textColor=colors.red,
            fontSize=12,
            fontName='Helvetica-Bold'
        ))

    def generate_report(self, vendor_data: Dict[str, Any], assessment_data: Dict[str, Any], filename: str = None) -> str:
        """
        Generates a PDF Risk Assessment Report.
        
        Args:
            vendor_data: Dict containing 'name', 'domain', 'description'
            assessment_data: Dict containing 'score', 'date', 'findings' (list of dicts)
            filename: Optional filename override
        
        Returns:
            Absolute path to the generated PDF.
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"RiskAssessment_{vendor_data['name'].replace(' ', '_')}_{timestamp}.pdf"
            
        filepath = os.path.join(self.output_dir, filename)
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        
        story = []
        
        # --- Title Page ---
        story.append(Spacer(1, 50))
        story.append(Paragraph(f"Vendor Risk Assessment Report", self.styles['ReportTitle']))
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"Vendor: {vendor_data.get('name', 'Unknown Vendor')}", self.styles['Heading1']))
        story.append(Paragraph(f"Domain: {vendor_data.get('domain', 'N/A')}", self.styles['Normal']))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", self.styles['Normal']))
        story.append(Spacer(1, 40))
        
        # --- Executive Summary ---
        score = assessment_data.get('score', 0)
        risk_level = "LOW" if score >= 80 else "MEDIUM" if score >= 50 else "HIGH"
        color = colors.green if score >= 80 else colors.orange if score >= 50 else colors.red
        
        story.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        
        summary_data = [
            ['Overall Risk Score', f"{score} / 100"],
            ['Risk Level', risk_level],
            ['Assessment ID', assessment_data.get('id', 'N/A')]
        ]
        
        t = Table(summary_data, colWidths=[200, 200])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (1, 1), (1, 1), color),
            ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))
        
        # --- Compliance Certifications ---
        certs = vendor_data.get('certs', [])
        if certs:
            story.append(Paragraph("Compliance Certifications", self.styles['SectionHeader']))
            cert_text = ", ".join(certs)
            story.append(Paragraph(cert_text, self.styles['Normal']))
            story.append(Spacer(1, 15))

        # --- Key Findings ---
        findings = assessment_data.get('findings', [])
        if findings:
            story.append(Paragraph("Key Risk Findings", self.styles['SectionHeader']))
            
            # Table Header
            data = [['Severity', 'Description']]
            
            for finding in findings:
                sev = finding.get('severity', 'UNKNOWN')
                desc = finding.get('issue', str(finding))
                
                # Truncate desc if needed or wrap
                p_desc = Paragraph(desc, self.styles['Normal'])
                data.append([sev, p_desc])
            
            t_findings = Table(data, colWidths=[80, 400])
            t_findings.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('RowBackgrounds', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
            ]))
            story.append(t_findings)
        
        # --- Disclaimer ---
        story.append(Spacer(1, 50))
        story.append(Paragraph("Disclaimer: This report is generated automatically by VendorScope AI. Verification of documents is recommended.", self.styles['Italic']))

        doc.build(story)
        return os.path.abspath(filepath)
