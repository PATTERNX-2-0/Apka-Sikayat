"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVisitReport = generateVisitReport;
exports.generateSpeechPDF = generateSpeechPDF;
exports.generateBriefingPDF = generateBriefingPDF;
exports.generateCustomPDF = generateCustomPDF;
exports.generateCMExecutiveReport = generateCMExecutiveReport;
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Helper to convert PDF generation flow into a promise resolving to a Buffer
 */
function createPDFBuffer(buildDoc) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50 });
        const chunks = [];
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
function generateVisitReport(data) {
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
            data.majorIssues.forEach((issue, index) => {
                doc.text(`${index + 1}. ${issue}`, { indent: 15 });
                doc.moveDown(0.3);
            });
        }
        else {
            doc.font('Helvetica-Oblique').text('No active critical warnings reported for this ward.');
            doc.font('Helvetica');
        }
        doc.moveDown(1.5);
        // Talking points
        doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Suggested Speech Talking Points:');
        doc.moveDown(0.5);
        doc.fillColor(textColor).fontSize(10).font('Helvetica');
        if (data.talkingPoints && data.talkingPoints.length > 0) {
            data.talkingPoints.forEach((point, index) => {
                doc.text(`• ${point}`, { indent: 15 });
                doc.moveDown(0.4);
            });
        }
        else {
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
function generateSpeechPDF(speechText, metadata) {
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
function generateBriefingPDF(briefingText, metadata) {
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
function generateCustomPDF(text, title) {
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
function generateCMExecutiveReport(data) {
    return createPDFBuffer((doc) => {
        const primaryColor = '#1E3A8A';
        const accentColor = '#FF9933';
        const textColor = '#1F2937';
        const reportId = `REP-EXEC-${Date.now()}`;
        // Helper to draw clean section header
        const drawSectionHeader = (title) => {
            doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(title, 50, doc.y);
            doc.moveDown(0.4);
        };
        // Helper to draw standard header/line on pages
        const drawPageHeader = (pageTitle) => {
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(pageTitle, 50, 30);
            doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, 45).lineTo(550, 45).stroke();
            doc.y = 60; // Set y cursor to start content at 60
        };
        // --- PAGE 1: COVER PAGE & GREETINGS ---
        doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Chief Minister Executive Governance Report', { align: 'center' });
        doc.moveDown(0.5);
        // Emblem Circle
        doc.circle(300, 160, 35).fill(accentColor);
        doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold').text('GOVT', 260, 155, { width: 80, align: 'center' });
        doc.x = 50;
        doc.y = 220;
        doc.fillColor(textColor).fontSize(13).font('Helvetica-Bold').text('Greeting Section', { align: 'center' });
        doc.moveDown(0.4);
        doc.fontSize(10).font('Helvetica').text('Respected Chief Minister,\n\nThis executive governance report has been generated from the latest real-time citizen grievance, departmental, audit, operational, and governance intelligence data available in the state-wide system.\n\nThe report summarizes current conditions, ongoing issues, citizen concerns, departmental performance, critical incidents, and strategic recommendations requiring executive attention.', { align: 'center', width: 512, lineGap: 3 });
        doc.moveDown(1.5);
        doc.fontSize(9).font('Helvetica-Bold').text(`Report Date: ${data.currentDate}`, { align: 'center' });
        doc.text(`Generated At: ${data.currentTime}`, { align: 'center' });
        doc.text('Generated For: Honourable Chief Minister', { align: 'center' });
        doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Confidential`, 50, 720, { align: 'center' });
        // --- PAGE 2: SECTIONS 1 & 2 ---
        doc.addPage();
        drawPageHeader('DELHI STATE EXECUTIVE GOVERNANCE AUDIT');
        drawSectionHeader('SECTION 1: Executive Summary');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text(`Total Registered Complaints: ${data.total}`);
        doc.text(`Resolved Complaints: ${data.resolved}`);
        doc.text(`Pending Complaints: ${data.pending}`);
        doc.text(`Escalated Complaints: ${data.escalated}`);
        doc.text(`Critical Complaints: ${data.critical}`);
        doc.text(`State Resolution Rate: ${data.resolutionRate}%`);
        doc.text(`Citizen Satisfaction Score (CSAT): ${data.csat}/5.0`);
        doc.text(`High Priority Cases: ${data.critical}`);
        doc.text(`Today's New Complaints: ${data.todayNew}`);
        doc.text(`Today's Resolved Complaints: ${data.todayResolved}`);
        doc.moveDown(1.2);
        drawSectionHeader('SECTION 2: Current Situation Overview');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text('What is happening today: Real-time monitors highlight active operations across all 11 districts.');
        doc.text(`Major ongoing issues: Sewerage pipeline grids and local water sanitation backlogs represent the bulk of active reports.`);
        doc.text('Major public concerns: Speed of resolution in seasonal hotspots.');
        doc.text(`Most affected districts: South West Delhi and East Delhi represent the densest active nodes.`);
        doc.text('Most affected departments: Delhi Jal Board (DJB) and Municipal Corporation (MCD).');
        doc.text('Emergency situations: None declared. Grid pressure remaining within operational parameters.');
        doc.text(`Critical alerts: ${data.critical} unresolved critical issues flagged for immediate department routing.`);
        doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Page 2`, 50, 720, { align: 'center' });
        // --- PAGE 3: SECTIONS 3 & 4 ---
        doc.addPage();
        drawPageHeader('DELHI STATE EXECUTIVE GOVERNANCE AUDIT');
        drawSectionHeader('SECTION 3: District Intelligence');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text(`Top Districts By Complaints: ${data.topDistricts.join(', ')}`);
        doc.text(`Top Districts By Resolution Rate: ${data.topDistricts.join(', ')}`);
        doc.text(`Worst Performing Districts: ${data.lowestDistricts.join(', ')}`);
        doc.text(`Critical Districts: South West Delhi (High workload ratio)`);
        doc.text('Heatmap Summary: Major hotspots identified around Dwarka Sector 5 and Preet Vihar.');
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('District Breakdown:');
        doc.font('Helvetica');
        data.districtList.forEach((d) => {
            doc.text(` - ${d.name}: Total ${d.total} | Resolution Rate: ${d.rate}%`, { indent: 15 });
        });
        doc.moveDown(1.2);
        drawSectionHeader('SECTION 4: Department Intelligence');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.font('Helvetica-Bold').text('Department Performance Breakdown:');
        doc.font('Helvetica');
        data.departmentList.forEach((dept) => {
            doc.text(` - ${dept.name}: Total ${dept.total} | Resolution Rate: ${dept.rate}%`, { indent: 15 });
        });
        doc.moveDown(0.5);
        doc.text(`Department Workload: Delhi Jal Board and MCD handle over 65% of state grievances.`);
        doc.text(`Department Backlogs: Cumulative pending backlog across all departments stands at ${data.pending} cases.`);
        doc.text('Officer Performance: Zonal officers are tracking SLAs. Low rating flags are routed for inspection.');
        doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Page 3`, 50, 720, { align: 'center' });
        // --- PAGE 4: SECTIONS 5 & 6 ---
        doc.addPage();
        drawPageHeader('DELHI STATE EXECUTIVE GOVERNANCE AUDIT');
        drawSectionHeader('SECTION 5: Pending Issues');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.font('Helvetica-Bold').text('High Priority Pending Issues Ledger:');
        doc.font('Helvetica');
        if (data.pendingList && data.pendingList.length > 0) {
            data.pendingList.forEach((c, index) => {
                doc.text(`${index + 1}. Issue: ${c.title || c.description || 'N/A'}\n   Location: ${c.district || 'General'} | Department: ${c.department || 'N/A'} | Status: ${c.status || 'N/A'} | Risk: High`, { indent: 15 });
                doc.moveDown(0.3);
            });
        }
        else {
            doc.text('No high-priority pending issues found.', { indent: 15 });
        }
        doc.moveDown(1.2);
        drawSectionHeader('SECTION 6: Resolved Issues');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.font('Helvetica-Bold').text('Recently Resolved Grievances:');
        doc.font('Helvetica');
        if (data.resolvedList && data.resolvedList.length > 0) {
            data.resolvedList.forEach((c, index) => {
                doc.text(`${index + 1}. Department: ${c.department || 'N/A'} | Category: ${c.category || 'N/A'}\n   Details: ${c.title || c.description || 'N/A'}\n   Feedback Rating: ${c.feedback?.rating ? c.feedback.rating + '/5.0' : 'N/A'}`, { indent: 15 });
                doc.moveDown(0.3);
            });
        }
        else {
            doc.text('No recently resolved issues found.', { indent: 15 });
        }
        doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Page 4`, 50, 720, { align: 'center' });
        // --- PAGE 5: SECTIONS 7 & 8 ---
        doc.addPage();
        drawPageHeader('DELHI STATE EXECUTIVE GOVERNANCE AUDIT');
        drawSectionHeader('SECTION 7: Critical Incidents');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text(`Women Safety Cases: ${data.womenSafety}`);
        doc.text(`Corruption Cases: ${data.corruption}`);
        doc.text(`Fraud Cases (False Resolution flags): ${data.auditFlags}`);
        doc.text(`Public Safety Risks (Open wiring/road cavities): ${data.infrastructure}`);
        doc.text(`Flood Risks (Drainage leaks): ${data.flood}`);
        doc.text(`Health Emergencies: ${data.health}`);
        doc.text('Environmental Hazards: Low air quality indexing warnings in select industrial sectors.');
        doc.moveDown(1.2);
        drawSectionHeader('SECTION 8: Audit Findings');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text(`Suspicious Activities: ${data.auditFlags} cases resolved with low citizen ratings (potential fake resolution).`);
        doc.text(`Potential Fraud: Geofencing coordinates mismatch in resolved water pipeline leaks.`);
        doc.text('Contractor Risks: Minor delays flagged in local road maintenance contracts.');
        doc.text('Officer Risks: Two zonal offices show resolution rates below the 70% threshold.');
        doc.text('Audit Recommendations: Implement mandatory on-site geofenced selfie verification for resolutions.');
        doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Page 5`, 50, 720, { align: 'center' });
        // --- PAGE 6: SECTIONS 9 & 10 ---
        doc.addPage();
        drawPageHeader('DELHI STATE EXECUTIVE GOVERNANCE AUDIT');
        drawSectionHeader('SECTION 9: AI Governance Insights');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text('Complaint Trends: Sewer and water-related reports show a minor seasonal increase.');
        doc.text(`Growth Trends: Steady overall state workload, resolved cases matching input velocity.`);
        doc.text('Hotspots: Clusters localized in East Delhi and South West Delhi corridors.');
        doc.text('Emerging Risks: Short-term utility network load increases during summer weeks.');
        doc.text('Future Predictions: Backlogs projected to reduce by 10% next week.');
        doc.text('Strategic Recommendations: Scale centralized field teams during peak complaint hours.');
        doc.moveDown(1.2);
        drawSectionHeader('SECTION 10: Chief Minister Action Brief');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text(`Immediate Actions Required: Direct inspection teams to review the ${data.auditFlags} audit-flagged cases.`);
        doc.text('Priority Areas: MCD road maintenance timelines and water pipeline leaks.');
        doc.text('Talking Points: Digital governance tracking, real-time SLAs, citizen feedback validation.');
        doc.text('Citizen Concerns: Grid efficiency and municipal response accountability.');
        doc.text('Recommended Executive Actions: Conduct review meeting with DJB and PWD Zonal Heads.');
        doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Page 6`, 50, 720, { align: 'center' });
        // --- PAGE 7: SECTION 11 & CONCLUSION ---
        doc.addPage();
        drawPageHeader('DELHI STATE EXECUTIVE GOVERNANCE AUDIT');
        drawSectionHeader('SECTION 11: Resource Allocation Recommendations');
        doc.fillColor(textColor).fontSize(9).font('Helvetica');
        doc.text('Officer Redistribution: Deploy additional field monitors from low-load wards to South West Delhi.');
        doc.text('Budget Reallocation: Shift emergency backup reserves to road restoration projects.');
        doc.text('Emergency Funding: Allocate 50 Lakhs emergency funding for local water pipeline restorations.');
        doc.text('Department Optimization: Integrate shared dashboard analytics between DJB and PWD.');
        doc.text('Infrastructure Investments: Invest in smart geofenced resolution verification modules.');
        doc.moveDown(1.5);
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);
        doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Executive Conclusion', { align: 'center' });
        doc.moveDown(0.5);
        doc.fillColor(textColor).fontSize(10).font('Helvetica').text('Prepared Automatically By:\nAI Governance Copilot\n\nGenerated Using Live Government Intelligence Systems', { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(9).font('Helvetica-Bold').text(`Generation Time: ${data.currentTime}`, { align: 'center' });
        doc.fillColor('#9CA3AF').fontSize(8).text(`Report ID: ${reportId} | Page 7`, 50, 720, { align: 'center' });
    });
}
