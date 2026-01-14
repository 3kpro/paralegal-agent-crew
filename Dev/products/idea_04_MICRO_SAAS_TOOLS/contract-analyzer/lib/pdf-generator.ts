import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResponse } from '@/app/actions/analyze-contract';

export function generateAnalysisPDF(results: AnalysisResponse, filename: string = 'Contract_Analysis_Report.pdf') {
  const doc = new jsPDF();
  
  // Colors (Professional Blue Scheme)
  const primaryColor = [20, 80, 160] as [number, number, number]; // #1450A0
  const secondaryColor = [60, 60, 60] as [number, number, number];
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ContractGuard AI', 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Risk Analysis Report', 14, 30);
  doc.text(new Date().toLocaleDateString(), 180, 20, { align: 'right' });

  // Summary Section
  let yPos = 50;
  
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  
  // Multi-line summary text
  const splitSummary = doc.splitTextToSize(results.summary, 180);
  doc.text(splitSummary, 14, yPos);
  
  yPos += (splitSummary.length * 7) + 10;

  // Risk Statistics
  const counts = {
    Critical: results.risks.filter(r => r.severity === 'Critical').length,
    Medium: results.risks.filter(r => r.severity === 'Medium').length,
    Low: results.risks.filter(r => r.severity === 'Low').length,
  };

  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPos, 196, yPos);
  yPos += 10;

  doc.setTextColor(200, 0, 0); // Red
  doc.setFont('helvetica', 'bold');
  doc.text(`Critical Risks: ${counts.Critical}`, 14, yPos);
  
  doc.setTextColor(230, 100, 0); // Orange
  doc.text(`Medium Risks: ${counts.Medium}`, 80, yPos);
  
  doc.setTextColor(0, 100, 200); // Blue
  doc.text(`Low Risks: ${counts.Low}`, 140, yPos);
  
  yPos += 15;

  // Detailed Risks Table
  const tableData = results.risks.map(risk => [
    risk.severity.toUpperCase(),
    risk.category,
    `${risk.issue}\n\nClause: "${risk.clause?.substring(0, 100)}${risk.clause?.length > 100 ? '...' : ''}"`,
    risk.suggestion
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Severity', 'Category', 'Issue & Clause', 'Suggestion']],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 }, // Severity
      1: { cellWidth: 30 }, // Category
      2: { cellWidth: 65 }, // Issue
      3: { cellWidth: 60 }  // Suggestion
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250]
    },
    didParseCell: (data) => {
      // Color code the Severity column text
      if (data.section === 'body' && data.column.index === 0) {
        const severity = data.cell.raw as string;
        if (severity === 'CRITICAL') {
            data.cell.styles.textColor = [200, 0, 0];
        } else if (severity === 'MEDIUM') {
            data.cell.styles.textColor = [220, 100, 0];
        } else {
            data.cell.styles.textColor = [0, 100, 200];
        }
      }
    }
  });

  // Footer Disclaimer
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Disclaimer: ContractGuard AI is an automated tool and does not provide legal advice. Consult an attorney for binding legal review.', 
      105, 
      290, 
      { align: 'center' }
    );
  }

  doc.save(filename);
}

export function generateTemplatePDF(name: string, content: string, filename: string = 'Contract_Template.pdf') {
  const doc = new jsPDF();
  const primaryColor = [20, 80, 160] as [number, number, number];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ContractGuard AI', 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Legal Template Library', 14, 30);
  doc.text(new Date().toLocaleDateString(), 180, 20, { align: 'right' });

  // Title
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 14, 60);

  // Content
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const splitText = doc.splitTextToSize(content, 180);
  
  let yPos = 70;
  const pageHeight = 280;

  splitText.forEach((line: string) => {
    if (yPos > pageHeight) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 14, yPos);
    yPos += 7;
  });

  // Footer
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Notice: This template is for informational purposes. Always consult an attorney before signing.', 
      105, 
      290, 
      { align: 'center' }
    );
  }

  doc.save(filename);
}
