import csv
import io
import json
from datetime import datetime
from sqlalchemy.orm import Session
from .analysis import Analyzer

class ReportExporter:
    def __init__(self, db: Session, repo_id: int):
        self.db = db
        self.repo_id = repo_id
        self.analyzer = Analyzer(db)

    def generate_json_report(self):
        """
        Generate a comprehensive JSON report containing all analysis data.
        """
        data = {
            "generated_at": datetime.utcnow().isoformat(),
            "repository_id": self.repo_id,
            "stats": self.analyzer.get_repo_stats(self.repo_id),
            "reviewer_matrix": self.analyzer.get_reviewer_matrix(self.repo_id),
            "anomalies": self.analyzer.detect_anomalies(self.repo_id),
            "bias_risks": self.analyzer.detect_bias(self.repo_id)
        }
        return json.dumps(data, indent=2)

    def generate_csv_report(self):
        """
        Generate a CSV report. 
        Since the data is hierarchical/multi-faceted, we'll generate a ZIP containing multiple CSVs 
        (e.g., stats.csv, risks.csv) OR for this MVP just a flat 'Risks & Anomalies' CSV report.
        Let's do 'Risks & Anomalies' CSV as it's the most actionable.
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['Type', 'Severity', 'Reviewer', 'Target/Author', 'Metric/Deviation'])

        # 1. Anomalies (Speed)
        anomalies = self.analyzer.detect_anomalies(self.repo_id)
        for item in anomalies:
            writer.writerow([
                f"Speed: {item['type']}",
                item['severity'],
                item['reviewer'],
                item['author'],
                item['deviation']
            ])

        # 2. Bias Risks (Tone/Nitpick)
        risks = self.analyzer.detect_bias(self.repo_id)
        for item in risks:
            writer.writerow([
                f"Bias: {item['type']}",
                item['severity'],
                item['reviewer'],
                item['target'],
                item['metric']
            ])
            
        return output.getvalue()
