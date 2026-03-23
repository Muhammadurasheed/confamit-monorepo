import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportData {
  receiptId: string;
  trustScore: number;
  verdict: string;
  recommendation: string;
  issues: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  forensicDetails: {
    ocr_confidence: number;
    manipulation_score: number;
    metadata_flags: string[];
    forensic_findings?: Array<{
      category: string;
      severity: string;
      finding: string;
      explanation: string;
    }>;
    techniques_detected?: string[];
    authenticity_indicators?: string[];
  };
  merchant?: {
    name: string;
    verified: boolean;
    trust_score: number;
  } | null;
  ocrText?: string;
  receiptImageUrl?: string;
  timestamp?: string;
}

export const exportAnalysisAsPDF = async (data: ExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Header with branding
  doc.setFillColor(99, 102, 241); // Primary color
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ConfirmIT', 15, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Receipt Verification Report', 15, 25);
  
  yPos = 45;

  // Receipt Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt Analysis Report', 15, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt ID: ${data.receiptId}`, 15, yPos);
  yPos += 5;
  doc.text(`Generated: ${data.timestamp || new Date().toLocaleString()}`, 15, yPos);
  yPos += 10;

  // Trust Score Section (Visual gauge representation)
  checkPageBreak(40);
  doc.setFillColor(240, 240, 245);
  doc.rect(15, yPos, pageWidth - 30, 35, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Trust Score', 20, yPos + 10);
  
  // Draw trust score gauge
  const gaugeX = pageWidth - 70;
  const gaugeY = yPos + 5;
  const gaugeRadius = 15;
  
  // Background circle
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(3);
  doc.circle(gaugeX, gaugeY + 10, gaugeRadius, 'S');
  
  // Score arc
  const scoreColor: [number, number, number] = data.trustScore >= 70 ? [34, 197, 94] : 
                     data.trustScore >= 40 ? [234, 179, 8] : [239, 68, 68];
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(3);
  
  const startAngle = -90;
  const endAngle = startAngle + (data.trustScore / 100) * 360;
  
  // Draw score text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${data.trustScore}`, gaugeX - 5, gaugeY + 13);
  
  yPos += 25;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Verdict badge
  const verdictColor: [number, number, number] = data.verdict === 'authentic' ? [34, 197, 94] :
                       data.verdict === 'fraudulent' ? [239, 68, 68] :
                       data.verdict === 'suspicious' ? [234, 179, 8] : [59, 130, 246];
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(20, yPos, 40, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(data.verdict.toUpperCase(), 23, yPos + 5.5);
  
  yPos += 15;

  // Recommendation
  checkPageBreak(25);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendation', 15, yPos);
  yPos += 5;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const recLines = doc.splitTextToSize(data.recommendation, pageWidth - 30);
  doc.text(recLines, 15, yPos);
  yPos += recLines.length * 5 + 10;

  // Merchant Information
  if (data.merchant) {
    checkPageBreak(25);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Merchant Information', 15, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.merchant.name}`, 20, yPos);
    yPos += 5;
    doc.text(`Status: ${data.merchant.verified ? 'Verified ✓' : 'Unverified'}`, 20, yPos);
    yPos += 5;
    doc.text(`Merchant Trust Score: ${data.merchant.trust_score}/100`, 20, yPos);
    yPos += 10;
  }

  // Forensic Analysis Metrics
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Forensic Analysis Metrics', 15, yPos);
  yPos += 7;

  const metricsData = [
    ['OCR Confidence', `${data.forensicDetails.ocr_confidence}%`],
    ['Manipulation Risk', `${data.forensicDetails.manipulation_score}%`],
    ['Metadata Flags', `${data.forensicDetails.metadata_flags.length} detected`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Detected Issues
  if (data.issues.length > 0) {
    checkPageBreak(35);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Detected Issues (${data.issues.length})`, 15, yPos);
    yPos += 7;

    const issuesData = data.issues.map(issue => [
      issue.type.replace(/_/g, ' '),
      issue.severity.toUpperCase(),
      issue.description,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Type', 'Severity', 'Description']],
      body: issuesData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 'auto' },
      },
      margin: { left: 15, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Forensic Findings
  if (data.forensicDetails.forensic_findings && data.forensicDetails.forensic_findings.length > 0) {
    checkPageBreak(35);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Forensic Findings', 15, yPos);
    yPos += 7;

    data.forensicDetails.forensic_findings.forEach((finding, index) => {
      const requiredSpace = 30;
      if (checkPageBreak(requiredSpace)) {
        // Page was added, yPos is reset
      }

      // Finding card
      const severityColor: [number, number, number] = finding.severity === 'critical' ? [239, 68, 68] :
                           finding.severity === 'high' ? [249, 115, 22] :
                           finding.severity === 'medium' ? [234, 179, 8] :
                           [34, 197, 94];
      
      doc.setDrawColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.setLineWidth(1);
      doc.rect(15, yPos, pageWidth - 30, 25);
      
      // Severity badge
      doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.roundedRect(18, yPos + 3, 20, 5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(finding.severity.toUpperCase(), 20, yPos + 6);
      
      // Category
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(finding.category, 42, yPos + 6);
      
      // Finding
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const findingLines = doc.splitTextToSize(finding.finding, pageWidth - 40);
      doc.text(findingLines, 18, yPos + 12);
      
      yPos += 28;
    });
    
    yPos += 5;
  }

  // Detection Techniques
  if (data.forensicDetails.techniques_detected && data.forensicDetails.techniques_detected.length > 0) {
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Detection Techniques Applied', 15, yPos);
    yPos += 6;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    data.forensicDetails.techniques_detected.forEach((technique) => {
      checkPageBreak(6);
      doc.text(`• ${technique}`, 20, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // Authenticity Indicators
  if (data.forensicDetails.authenticity_indicators && data.forensicDetails.authenticity_indicators.length > 0) {
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Authenticity Indicators', 15, yPos);
    yPos += 6;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    data.forensicDetails.authenticity_indicators.forEach((indicator) => {
      checkPageBreak(6);
      doc.text(`✓ ${indicator}`, 20, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // OCR Extracted Text
  if (data.ocrText && data.ocrText.trim()) {
    checkPageBreak(30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Extracted Text (OCR)', 15, yPos);
    yPos += 6;
    
    doc.setFillColor(245, 245, 245);
    const ocrLines = doc.splitTextToSize(data.ocrText, pageWidth - 40);
    const ocrBoxHeight = Math.min(ocrLines.length * 4 + 10, 40);
    
    checkPageBreak(ocrBoxHeight + 5);
    doc.rect(15, yPos, pageWidth - 30, ocrBoxHeight, 'F');
    
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text(ocrLines.slice(0, 10), 20, yPos + 5); // Limit to 10 lines
    yPos += ocrBoxHeight + 10;
  }

  // Receipt Image (if available)
  if (data.receiptImageUrl) {
    try {
      checkPageBreak(80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Receipt Image', 15, yPos);
      yPos += 7;
      
      // Add image placeholder
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, yPos, 80, 60);
      
      // Note about image
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Receipt image available at:', 20, yPos + 25);
      doc.text(data.receiptImageUrl.substring(0, 50) + '...', 20, yPos + 30);
      
      yPos += 65;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  // Footer
  const totalPages = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated by ConfirmIT - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Confidential - For authorized use only`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const filename = `ConfirmIT_Analysis_${data.receiptId}_${Date.now()}.pdf`;
  doc.save(filename);
  
  return filename;
};
