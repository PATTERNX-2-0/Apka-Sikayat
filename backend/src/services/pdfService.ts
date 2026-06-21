import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

// Try multiple relative paths or absolute path from backend root to locate Ashok Stambh logo
let logoPath = '';
const pathsToTry = [
  path.join(__dirname, '../assets/ashok_stambh_logo.png'), // src/services/ -> src/assets/
  path.join(__dirname, '../../../src/assets/ashok_stambh_logo.png'), // dist/src/services/ -> src/assets/
  path.join(process.cwd(), 'src/assets/ashok_stambh_logo.png'), // backend root -> src/assets/
  path.join(process.cwd(), 'backend/src/assets/ashok_stambh_logo.png') // repo root -> backend/src/assets/
];

for (const p of pathsToTry) {
  if (fs.existsSync(p)) {
    logoPath = p;
    break;
  }
}

/**
 * Helper to convert PDF generation flow into a promise resolving to a Buffer
 */
function createPDFBuffer(buildDoc: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margins: { top: 50, bottom: 80, left: 50, right: 50 } });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    buildDoc(doc);
    doc.end();
  });
}


/**
 * Generate Visit Briefing PDF Report
 */
export function generateVisitReport(data: any): Promise<Buffer> {
  return createPDFBuffer((doc) => {
    // Colors
    const primaryColor = '#1E3A8A';
    const accentColor = '#FF9933';
    const textColor = '#1F2937';

    // Header Title
    doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('CM GOVERNANCE BRIEFING', { align: 'center' });
    doc.moveDown(0.2);
    doc.fillColor(accentColor).fontSize(10).font('Helvetica-Bold').text(`LOCATION AUDIT SUMMARY - ${data.areaName.toUpperCase()}`, { align: 'center', characterSpacing: 1.5 });
    doc.moveDown(0.5);

    // Separator Line
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Grid Info Table
    doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text('Overview Stats:');
    doc.fontSize(10).font('Helvetica').text(`District Name: ${data.district}`);
    doc.text(`Total Active Complaints: ${data.total}`);
    doc.text(`Resolved: ${data.resolved} | Pending: ${data.pending}`);
    doc.text(`Critical Priorities: ${data.critical}`);
    doc.text(`CSAT Average Index: ${data.csat}/5.0`);
    doc.moveDown(1.5);

    // Major Issues
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Major System Failures Detected:');
    doc.moveDown(0.5);
    doc.fillColor(textColor).fontSize(10).font('Helvetica');
    if (data.majorIssues && data.majorIssues.length > 0) {
      data.majorIssues.forEach((issue: string, index: number) => {
        doc.text(`${index + 1}. ${issue}`, { indent: 15 });
        doc.moveDown(0.3);
      });
    } else {
      doc.font('Helvetica-Oblique').text('No active critical warnings reported for this ward.');
      doc.font('Helvetica');
    }
    doc.moveDown(1.5);

    // Talking points
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Suggested Speech Talking Points:');
    doc.moveDown(0.5);
    doc.fillColor(textColor).fontSize(10).font('Helvetica');
    if (data.talkingPoints && data.talkingPoints.length > 0) {
      data.talkingPoints.forEach((point: string, index: number) => {
        doc.text(`• ${point}`, { indent: 15 });
        doc.moveDown(0.4);
      });
    } else {
      doc.font('Helvetica-Oblique').text('No recommended speech guides mapped for this location.');
      doc.font('Helvetica');
    }
    doc.moveDown(1.5);

    // Recommendations
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('AI Recommended Actions:');
    doc.moveDown(0.5);
    doc.fillColor(textColor).fontSize(10).font('Helvetica');
    doc.text(`1. Emergency Budget Boost: ${data.budgetRecommendation}`);
    doc.text(`2. Zonal Officer Inspection: Shifting active field monitors to stabilize unresolved complaints.`);
  });
}

/**
 * Generate Speech Document PDF
 */
export function generateSpeechPDF(speechText: string, metadata: any): Promise<Buffer> {
  return createPDFBuffer((doc) => {
    doc.fillColor('#1E3A8A').fontSize(22).font('Helvetica-Bold').text('CHIEF MINISTER OFFICIAL SPEECH TRANSCRIPT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#FF9933').fontSize(10).font('Helvetica-Bold').text(`TARGET AREA: ${metadata.areaName.toUpperCase()} | DATE: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fillColor('#1F2937').fontSize(11).font('Helvetica').text(speechText, {
      lineGap: 6,
      align: 'justify'
    });
  });
}

/**
 * Generate Governance Briefing PDF
 */
export function generateBriefingPDF(briefingText: string, metadata: any): Promise<Buffer> {
  return createPDFBuffer((doc) => {
    doc.fillColor('#1E3A8A').fontSize(22).font('Helvetica-Bold').text('EXECUTIVE STATE BRIEFING REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#FF9933').fontSize(10).font('Helvetica-Bold').text(`PERIOD: ${metadata.type.toUpperCase()} BRIEF | GENERATED: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fillColor('#1F2937').fontSize(11).font('Helvetica').text(briefingText, {
      lineGap: 5,
      align: 'justify'
    });
  });
}

/**
 * Generate Custom PDF for Chatbot Responses
 */
export function generateCustomPDF(text: string, title: string): Promise<Buffer> {
  return createPDFBuffer((doc) => {
    doc.fillColor('#1E3A8A').fontSize(20).font('Helvetica-Bold').text(title.toUpperCase(), { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#FF9933').fontSize(10).font('Helvetica-Bold').text(`DELHI STATE GOVERNANCE PORTAL | GENERATED: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fillColor('#1F2937').fontSize(11).font('Helvetica').text(text, {
      lineGap: 5,
      align: 'justify'
    });
  });
}

/**
 * Generate CM Executive Governance Report PDF (11 Sections)
 */
export function generateCMExecutiveReport(data: any): Promise<Buffer> {
  return createPDFBuffer((doc) => {
    const primaryColor = '#1E3A8A';
    const accentColor = '#FF9933';
    const textColor = '#1F2937';
    const reportId = `REP-EXEC-${Date.now()}`;

    // Helper to draw clean section header
    const drawSectionHeader = (title: string) => {
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(title, 50, doc.y);
      doc.moveDown(0.4);
    };

    // Helper to draw standard header/line on pages
    const drawPageHeader = (pageTitle: string) => {
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(pageTitle, 50, 30);
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, 45).lineTo(550, 45).stroke();
    };

    // Register dynamic page creation header/footer to avoid fixed spacing breaks
    doc.on('pageAdded', () => {
      const savedBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0; // Temporarily disable bottom margin to avoid infinite page break recursion

      drawPageHeader('DELHI STATE EXECUTIVE GOVERNANCE AUDIT');
      doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Confidential`, 50, 755, { align: 'center' });

      doc.page.margins.bottom = savedBottom; // Restore bottom margin
      doc.y = 65;
    });

    if (data.isComplaintsOnly) {
      // --- PAGE 1: COVER PAGE ---
      doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Daily Grievance Ledger', { align: 'center' });
      doc.moveDown(0.5);
      
      if (logoPath) {
        doc.image(logoPath, 265, 110, { width: 70 });
      } else {
        doc.circle(300, 160, 35).fill(accentColor);
        doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('GOVT', 260, 155, { width: 80, align: 'center' });
      }
      
      doc.x = 50;
      doc.y = 220;
      
      doc.fillColor(textColor).fontSize(13).font('Helvetica-Bold').text('Official Grievance Summary Ledger', { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').text(
        'Respected Chief Minister,\n\nThis document contains the official list of citizen complaints registered in the state system for the specified period. No automated analysis or recommendations are included in this ledger.',
        { align: 'center', width: 512, lineGap: 3 }
      );

      doc.moveDown(1.5);
      doc.fontSize(9).font('Helvetica-Bold').text(`Ledger Date: ${data.currentDate}`, { align: 'center' });
      doc.text(`Total Registered Complaints: ${data.total}`, { align: 'center' });
      doc.text('Generated For: Honourable Chief Minister', { align: 'center' });

      const savedBottomCover = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Confidential`, 50, 755, { align: 'center' });
      doc.page.margins.bottom = savedBottomCover;

      // --- PAGE 2: COMPLAINTS LIST ---
      doc.addPage();
      
      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Registered Complaints List', 50, doc.y);
      doc.moveDown(0.5);
      
      if (data.complaintsList && data.complaintsList.length > 0) {
        data.complaintsList.forEach((c: any, index: number) => {
          doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ID: ${c.id || 'N/A'} - ${c.title || 'Untitled'}`, { lineGap: 2 });
          doc.font('Helvetica').fontSize(9).text(`Description: ${c.description || 'N/A'}`, { indent: 15, lineGap: 2 });
          doc.text(`District: ${c.district || 'General'} | Department: ${c.department || 'General'} | Status: ${c.status || 'Pending'} | Priority: ${c.priority || 'Normal'} | Date: ${c.createdAtStr || 'N/A'}`, { indent: 15, lineGap: 2 });
          doc.moveDown(0.8);
        });
      } else {
        doc.fillColor(textColor).fontSize(10).text('No complaints registered for this period.');
      }
      return;
    }

    // --- PAGE 1: COVER PAGE & GREETINGS ---
    doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Chief Minister Executive Governance Report', { align: 'center' });
    doc.moveDown(0.5);
    
    // Emblem Circle/Image
    if (logoPath) {
      doc.image(logoPath, 265, 110, { width: 70 });
    } else {
      doc.circle(300, 160, 35).fill(accentColor);
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('GOVT', 260, 155, { width: 80, align: 'center' });
    }
    
    doc.x = 50;
    doc.y = 220;
    
    doc.fillColor(textColor).fontSize(13).font('Helvetica-Bold').text('Greeting Section', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(10).font('Helvetica').text(
      'Respected Chief Minister,\n\nThis executive governance report has been generated from the latest real-time citizen grievance, departmental, audit, operational, and governance intelligence data available in the state-wide system.\n\nThe report summarizes current conditions, ongoing issues, citizen concerns, departmental performance, critical incidents, and strategic recommendations requiring executive attention.',
      { align: 'center', width: 512, lineGap: 3 }
    );

    doc.moveDown(1.5);
    doc.fontSize(9).font('Helvetica-Bold').text(`Report Date: ${data.currentDate}`, { align: 'center' });
    doc.text(`Generated At: ${data.currentTime}`, { align: 'center' });
    doc.text('Generated For: Honourable Chief Minister', { align: 'center' });

    // Temporarily clear bottom margin to prevent cover page footer from triggering page overflow
    const savedBottomCover = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Confidential`, 50, 755, { align: 'center' });
    doc.page.margins.bottom = savedBottomCover;

    // --- PAGE 2: CONTENT CONTINUOUS FLOW ---
    doc.addPage();
    
    drawSectionHeader('SECTION 1: Executive Summary');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(`Total Registered Complaints: ${data.total}`);
    doc.text(`Resolved Complaints: ${data.resolved}`);
    doc.text(`Pending Complaints: ${data.pending}`);
    doc.text(`Escalated Complaints: ${data.escalated}`);
    doc.text(`Critical Complaints: ${data.critical}`);
    doc.text(`State Resolution Rate: ${data.resolutionRate}%`);
    doc.text(`Citizen Satisfaction Score (CSAT): ${data.csat}`);
    doc.text(`Today's New Complaints: ${data.todayNew}`);
    doc.text(`Today's Resolved Complaints: ${data.todayResolved}`);
    doc.moveDown(0.5);
    doc.text(data.executiveSummaryText || 'No executive summary available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 2: Current Situation Overview');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(data.currentSituationText || 'No situation overview available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 3: District Intelligence');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(`Top Districts By Complaints: ${data.topDistricts ? data.topDistricts.join(', ') : 'N/A'}`);
    doc.text(`Worst Performing Districts: ${data.lowestDistricts ? data.lowestDistricts.join(', ') : 'N/A'}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('District Breakdown:');
    doc.font('Helvetica');
    if (data.districtList && data.districtList.length > 0) {
      data.districtList.forEach((d: any) => {
        doc.text(` - ${d.name}: Total ${d.total} | Resolution Rate: ${d.rate}%`, { indent: 15 });
      });
    } else {
      doc.text('No district data available.', { indent: 15 });
    }
    doc.moveDown(0.5);
    doc.text(data.districtAnalysisText || 'No district analysis available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 4: Department Intelligence');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.font('Helvetica-Bold').text('Department Performance Breakdown:');
    doc.font('Helvetica');
    if (data.departmentList && data.departmentList.length > 0) {
      data.departmentList.forEach((dept: any) => {
        doc.text(` - ${dept.name}: Total ${dept.total} | Resolution Rate: ${dept.rate}%`, { indent: 15 });
      });
    } else {
      doc.text('No department data available.', { indent: 15 });
    }
    doc.moveDown(0.5);
    doc.text(data.departmentAnalysisText || 'No department analysis available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 5: Pending Issues');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.font('Helvetica-Bold').text('High Priority Pending Issues Ledger:');
    doc.font('Helvetica');
    if (data.pendingList && data.pendingList.length > 0) {
      data.pendingList.forEach((c: any, index: number) => {
        doc.text(`${index + 1}. Issue: ${c.title || c.description || 'N/A'}\n   Location: ${c.district || 'General'} | Department: ${c.department || 'N/A'} | Status: ${c.status || 'N/A'} | Priority: ${c.priority || 'N/A'}`, { indent: 15 });
        doc.moveDown(0.3);
      });
    } else {
      doc.text('No pending issues found.', { indent: 15 });
    }
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 6: Resolved Issues');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.font('Helvetica-Bold').text('Recently Resolved Grievances:');
    doc.font('Helvetica');
    if (data.resolvedList && data.resolvedList.length > 0) {
      data.resolvedList.forEach((c: any, index: number) => {
        doc.text(`${index + 1}. Department: ${c.department || 'N/A'} | Category: ${c.category || 'N/A'}\n   Details: ${c.title || c.description || 'N/A'}\n   Feedback Rating: ${c.feedback?.rating ? c.feedback.rating + '/5.0' : 'N/A'}`, { indent: 15 });
        doc.moveDown(0.3);
      });
    } else {
      doc.text('No recently resolved issues found.', { indent: 15 });
    }
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 7: Critical Incidents');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(data.riskAnalysisText || 'No risk analysis available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 8: Audit Findings');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(data.auditFindingsText || 'No audit findings available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 9: AI Governance Insights');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(data.aiInsightsText || 'No AI governance insights available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 10: Chief Minister Action Brief');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(data.cmBriefingText || 'No action brief available.', { lineGap: 2 });
    doc.moveDown(1.2);

    drawSectionHeader('SECTION 11: Resource Allocation Recommendations');
    doc.fillColor(textColor).fontSize(9).font('Helvetica');
    doc.text(data.resourceAllocationText || 'No resource allocation recommendations available.', { lineGap: 2 });
    doc.moveDown(1.5);

    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Executive Conclusion', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor(textColor).fontSize(10).font('Helvetica').text(
      'Prepared Automatically By:\nAI Governance Copilot\n\nGenerated Using Live Government Intelligence Systems',
      { align: 'center' }
    );
    doc.moveDown(1);
    doc.fontSize(9).font('Helvetica-Bold').text(`Generation Time: ${data.currentTime}`, { align: 'center' });
  });
}
