
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet

from ..database import get_db
from ..dependencies import verify_subscription
from ..services.analysis_service import AnalysisService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/export")
def export_report(
    repo_name: str,
    format: str = Query(..., regex="^(pdf|csv)$"),
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Exports analysis report for a repository.
    Format: 'pdf' or 'csv'.
    """
    analysis_service = AnalysisService(db)
    data = analysis_service.analyze_repo(repo_name)
    
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])

    if format == "csv":
        return export_csv(repo_name, data)
    elif format == "pdf":
        return export_pdf(repo_name, data)

@router.get("/health-check/{repo_name:path}")
def get_health_check(
    repo_name: str,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Returns executive summary metrics for a repository.
    Metrics: Nitpick %, Top Reviewers, Avg Pickup Time.
    """
    analysis_service = AnalysisService(db)
    metrics = analysis_service.get_health_check_metrics(repo_name)
    
    if "error" in metrics:
        raise HTTPException(status_code=404, detail=metrics["error"])
        
    return metrics

def export_csv(repo_name: str, data: dict):
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write Summary
    writer.writerow(["Repository", repo_name])
    writer.writerow(["Date", datetime.now().isoformat()])
    writer.writerow([])
    
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total PRs", data["summary"]["total_prs"]])
    writer.writerow(["Merged PRs", data["summary"]["merged_prs"]])
    writer.writerow(["Merge Rate", f"{data['summary']['merge_rate'] * 100}%"])
    writer.writerow(["Avg Merge Time (Hours)", data["summary"]["avg_merge_time_hours"]])
    writer.writerow([])
    
    # Write Top Reviewers
    writer.writerow(["Top Reviewers"])
    writer.writerow(["Login", "Reviews"])
    for r in data["top_reviewers"]:
        writer.writerow([r["login"], r["reviews"]])
    writer.writerow([])
    
    # Write Bias Alerts
    writer.writerow(["Bias Alerts"])
    writer.writerow(["Type", "Severity", "Message"])
    for alert in data.get("bias_alerts", []):
         writer.writerow([alert["type"], alert["severity"], alert["message"]])

    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=report_{repo_name.replace('/', '_')}.csv"
    return response

def export_pdf(repo_name: str, data: dict):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Title
    elements.append(Paragraph(f"ReviewLens Report: {repo_name}", styles['Title']))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 12))
    
    # Summary Section
    elements.append(Paragraph("Summary", styles['Heading2']))
    summary_data = [
        ["Metric", "Value"],
        ["Total PRs", str(data["summary"]["total_prs"])],
        ["Merged PRs", str(data["summary"]["merged_prs"])],
        ["Merge Rate", f"{data['summary']['merge_rate'] * 100}%"],
        ["Avg Merge Time", f"{data['summary']['avg_merge_time_hours']} hours"]
    ]
    t = Table(summary_data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))
    
    # Top Reviewers
    elements.append(Paragraph("Top Reviewers", styles['Heading2']))
    reviewer_data = [["Login", "Reviews"]]
    for r in data["top_reviewers"]:
        reviewer_data.append([r["login"], str(r["reviews"])])
        
    if len(reviewer_data) > 1:
        t2 = Table(reviewer_data)
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t2)
    else:
        elements.append(Paragraph("No reviewer data available.", styles['Normal']))
        
    elements.append(Spacer(1, 12))

    # Bias Alerts
    if data.get("bias_alerts"):
        elements.append(Paragraph("Bias Detection Alerts", styles['Heading2']))
        for alert in data["bias_alerts"]:
            text = f"<b>{alert['type']}</b> ({alert['severity']}): {alert['message']}"
            elements.append(Paragraph(text, styles['Normal']))
            elements.append(Spacer(1, 6))

    doc.build(elements)
    buffer.seek(0)
    
    response = StreamingResponse(buffer, media_type="application/pdf")
    response.headers["Content-Disposition"] = f"attachment; filename=report_{repo_name.replace('/', '_')}.pdf"
    return response
