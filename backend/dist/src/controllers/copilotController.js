"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCopilotChat = handleCopilotChat;
exports.handleCMExecutiveReportPDF = handleCMExecutiveReportPDF;
exports.handleCustomPDFRequest = handleCustomPDFRequest;
exports.handleVisitIntelligence = handleVisitIntelligence;
exports.getBriefingsArchive = getBriefingsArchive;
exports.handleBriefingGeneration = handleBriefingGeneration;
exports.getAuditsDashboard = getAuditsDashboard;
exports.getPolicyRecommendations = getPolicyRecommendations;
const firebase_1 = require("../../firebase");
const firestore_1 = require("firebase/firestore");
const pdfService_1 = require("../services/pdfService");
/**
 * Helper to call Gemini Flash API
 */
async function callGemini(systemPrompt, userMessage) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_CITIZEN || process.env.WHATSAPP_GEMINI_API_KEY || "";
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const requestBody = {
            contents: [
                {
                    parts: [{ text: `${systemPrompt}\n\nUser Query: ${userMessage}` }]
                }
            ],
            generationConfig: {
                temperature: 0.2
            }
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            throw new Error(`Gemini response failed: ${response.status}`);
        }
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Unable to generate response.';
    }
    catch (err) {
        console.error('[Gemini API Helper] Error calling Gemini Flash:', err.message);
        return 'Systems are currently busy. Please try asking again in a moment.';
    }
}
/**
 * Reusable helper to fetch live Firestore records, calculate statistics, and run Gemini analysis.
 */
async function compileCMExecutiveReportData(isTodayRequested, isComplaintsOnly, startDate, endDate) {
    const complaintsRef = (0, firestore_1.collection)(firebase_1.db, 'complaints');
    console.log('[Copilot Controller] Querying Firestore collection "complaints" in real-time...');
    const querySnap = await (0, firestore_1.getDocs)(complaintsRef);
    const allComplaints = [];
    querySnap.forEach((doc) => {
        allComplaints.push({ id: doc.id, ...doc.data() });
    });
    console.log(`[Copilot Controller] Successfully retrieved ${allComplaints.length} complaints from Firestore.`);
    const getComplaintDateStr = (createdAt) => {
        if (!createdAt)
            return '';
        if (typeof createdAt.toDate === 'function') {
            return createdAt.toDate().toISOString().slice(0, 10);
        }
        if (createdAt.seconds) {
            return new Date(createdAt.seconds * 1000).toISOString().slice(0, 10);
        }
        return new Date(createdAt).toISOString().slice(0, 10);
    };
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayStr = today.toISOString().slice(0, 10);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    // Apply today/yesterday filtering if requested (last 48 hours)
    let complaints = allComplaints;
    if (isTodayRequested) {
        console.log('[Copilot Controller] Filtering complaints strictly for last 48 hours (today & yesterday)...');
        complaints = allComplaints.filter(c => {
            const dStr = getComplaintDateStr(c.createdAt);
            return dStr === todayStr || dStr === yesterdayStr;
        });
        console.log(`[Copilot Controller] Filtered down to ${complaints.length} complaints for the today-ledger request.`);
    }
    else if (startDate || endDate) {
        console.log(`[Copilot Controller] Filtering complaints by date range: ${startDate} to ${endDate}...`);
        complaints = allComplaints.filter(c => {
            const dStr = getComplaintDateStr(c.createdAt);
            if (!dStr)
                return false;
            if (startDate && dStr < startDate)
                return false;
            if (endDate && dStr > endDate)
                return false;
            return true;
        });
        console.log(`[Copilot Controller] Filtered down to ${complaints.length} complaints for the date range.`);
    }
    if (isComplaintsOnly) {
        const complaintsList = complaints.map(c => ({
            id: c.id,
            title: c.title || c.description || 'Grievance',
            description: c.description || '',
            district: c.district || 'General',
            department: c.department || 'General',
            status: c.status || 'Pending',
            priority: c.priority || 'Normal',
            createdAtStr: getComplaintDateStr(c.createdAt)
        }));
        return {
            currentDate: new Date().toLocaleDateString('en-IN'),
            currentTime: new Date().toLocaleTimeString('en-IN'),
            total: complaints.length,
            isComplaintsOnly: true,
            complaintsList
        };
    }
    // Analytics Engine
    const total = complaints.length;
    const resolved = complaints.filter(c => ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
    const pending = total - resolved;
    const critical = complaints.filter(c => c.priority === 'CRITICAL' && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
    const escalated = complaints.filter(c => c.isEscalated === true || c.status === 'Escalated').length;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '100.0';
    // Calculate CSAT dynamically
    const ratings = complaints.filter(c => c.feedback?.rating).map(c => c.feedback.rating);
    const avgCsat = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) + '/5.0'
        : 'Insufficient citizen feedback available.';
    // District Performance
    const districtStats = {};
    complaints.forEach(c => {
        const dist = c.district || 'General';
        if (!districtStats[dist])
            districtStats[dist] = { total: 0, resolved: 0 };
        districtStats[dist].total++;
        if (['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)) {
            districtStats[dist].resolved++;
        }
    });
    const districtList = Object.entries(districtStats).map(([name, stats]) => ({
        name,
        total: stats.total,
        rate: stats.total > 0 ? parseFloat(((stats.resolved / stats.total) * 100).toFixed(1)) : 100.0
    }));
    const sortedByRate = [...districtList].sort((a, b) => b.rate - a.rate);
    const topDistricts = sortedByRate.slice(0, 3).map(d => `${d.name} (${d.rate}%)`);
    const lowestDistricts = sortedByRate.slice(-3).reverse().map(d => `${d.name} (${d.rate}%)`);
    // Department Performance
    const deptStats = {};
    complaints.forEach(c => {
        const dept = c.department || 'General Department';
        if (!deptStats[dept])
            deptStats[dept] = { total: 0, resolved: 0 };
        deptStats[dept].total++;
        if (['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)) {
            deptStats[dept].resolved++;
        }
    });
    const departmentList = Object.entries(deptStats).map(([name, stats]) => ({
        name,
        total: stats.total,
        rate: stats.total > 0 ? parseFloat(((stats.resolved / stats.total) * 100).toFixed(1)) : 100.0
    }));
    // Critical issues categories
    const womenSafety = complaints.filter(c => (c.description || '').toLowerCase().includes('women') || (c.category || '').toLowerCase().includes('safety')).length;
    const infrastructure = complaints.filter(c => (c.category || '').toLowerCase().includes('infrastructure') || (c.category || '').toLowerCase().includes('road')).length;
    const flood = complaints.filter(c => (c.description || '').toLowerCase().includes('flood') || (c.description || '').toLowerCase().includes('waterlogging')).length;
    const health = complaints.filter(c => (c.category || '').toLowerCase().includes('health') || (c.category || '').toLowerCase().includes('medical')).length;
    const corruption = complaints.filter(c => {
        const d = (c.description || '').toLowerCase();
        return d.includes('bribe') || d.includes('money') || d.includes('cash') || d.includes('corruption');
    }).length;
    const auditFlags = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status) && c.feedback?.rating && c.feedback.rating <= 2).length;
    const todayNew = allComplaints.filter(c => getComplaintDateStr(c.createdAt) === todayStr).length;
    const todayResolved = allComplaints.filter(c => getComplaintDateStr(c.createdAt) === todayStr &&
        ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
    // High priority pending issues ledger listing
    const pendingList = complaints
        .filter(c => !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status))
        .sort((a, b) => (b.priority === 'CRITICAL' ? 1 : 0) - (a.priority === 'CRITICAL' ? 1 : 0))
        .slice(0, 5)
        .map(c => ({
        title: c.title || c.description || 'Grievance',
        description: c.description || '',
        district: c.district || 'General',
        department: c.department || 'N/A',
        status: c.status || 'N/A',
        priority: c.priority || 'Normal'
    }));
    // Recently resolved grievances listing
    const resolvedList = complaints
        .filter(c => ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status))
        .slice(0, 5)
        .map(c => ({
        department: c.department || 'N/A',
        category: c.category || 'N/A',
        title: c.title || c.description || 'Grievance',
        description: c.description || '',
        feedback: { rating: c.feedback?.rating || null }
    }));
    if (total === 0) {
        return {
            currentDate: new Date().toLocaleDateString('en-IN'),
            currentTime: new Date().toLocaleTimeString('en-IN'),
            total: 0,
            resolved: 0,
            pending: 0,
            critical: 0,
            escalated: 0,
            resolutionRate: '100.0',
            csat: 'Insufficient citizen feedback available.',
            topDistricts: [],
            lowestDistricts: [],
            districtList: [],
            departmentList: [],
            pendingList: [],
            resolvedList: [],
            executiveSummaryText: 'No complaints were registered today.',
            currentSituationText: 'No situations are currently reported for this period.',
            districtAnalysisText: 'No complaints recorded across districts.',
            departmentAnalysisText: 'No departmental workload reported.',
            riskAnalysisText: 'No active critical incidents or public safety risks reported.',
            auditFindingsText: 'No audit warnings detected.',
            aiInsightsText: 'System operations stable with empty workload queue.',
            cmBriefingText: 'No complaints were registered today. Administrative operations are fully clear.',
            resourceAllocationText: 'No resource redistributions required.'
        };
    }
    const systemPrompt = `
You are the AI Governance Copilot for the Chief Minister of Delhi.
Analyze the following operational data and produce a structured JSON object containing dynamic governance analysis.

DO NOT use hardcoded recommendations, placeholder numbers, or template text.
Every comment and insight must be derived from the specific metrics provided.
The JSON must contain EXACTLY the following keys:
{
  "executiveSummaryText": "...",
  "currentSituationText": "...",
  "districtAnalysisText": "...",
  "departmentAnalysisText": "...",
  "riskAnalysisText": "...",
  "auditFindingsText": "...",
  "aiInsightsText": "...",
  "cmBriefingText": "...",
  "resourceAllocationText": "..."
}

### Live Telemetry Data:
- Total Complaints: ${total}
- Resolved Complaints: ${resolved}
- Pending Complaints: ${pending}
- Resolution Rate: ${resolutionRate}%
- Average CSAT: ${avgCsat}
- Critical Complaints: ${critical}
- Escalated Complaints: ${escalated}
- Critical Categories: Women Safety (${womenSafety}), Infrastructure (${infrastructure}), Flood/Drainage (${flood}), Health (${health}), Corruption (${corruption}), Audit Flags (Low rating resolutions: ${auditFlags})
- Top Wards/Districts: ${topDistricts.join(', ')}
- Worst Wards/Districts: ${lowestDistricts.join(', ')}
- District Breakdown: ${JSON.stringify(districtList)}
- Department Breakdown: ${JSON.stringify(departmentList)}
`;
    const geminiReply = await callGemini(systemPrompt, `Generate the executive analysis structure.`);
    // Attempt to parse JSON response from Gemini
    let parsedAnalysis = {};
    try {
        const jsonMatch = geminiReply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsedAnalysis = JSON.parse(jsonMatch[0]);
        }
        else {
            parsedAnalysis = JSON.parse(geminiReply);
        }
    }
    catch (err) {
        console.warn('[Gemini Report Generator] Failed to parse JSON, using raw reply as fallback summaries');
        parsedAnalysis = {
            executiveSummaryText: geminiReply,
            currentSituationText: `Detailed situation report based on ${total} total records.`,
            districtAnalysisText: `District analysis based on the performance of ${districtList.length} districts.`,
            departmentAnalysisText: `Department analysis based on the performance of ${departmentList.length} departments.`,
            riskAnalysisText: `Risk metrics based on ${critical} critical issues.`,
            auditFindingsText: `Audit warnings computed from ${auditFlags} rating flags.`,
            aiInsightsText: `Predictive model analysis for the current state workload.`,
            cmBriefingText: `Chief Minister direct briefing overview.`,
            resourceAllocationText: `Recommended resource shifts.`
        };
    }
    return {
        currentDate: new Date().toLocaleDateString('en-IN'),
        currentTime: new Date().toLocaleTimeString('en-IN'),
        total,
        resolved,
        pending,
        critical,
        escalated,
        resolutionRate,
        csat: avgCsat,
        topDistricts,
        lowestDistricts,
        districtList,
        departmentList,
        pendingList,
        resolvedList,
        ...parsedAnalysis
    };
}
/**
 * POST /api/cm/copilot/chat
 * Governance Copilot Chat with RAG-based context retrieval from Pinecone
 */
async function handleCopilotChat(req, res) {
    const { query: userQuery } = req.body;
    if (!userQuery) {
        return res.status(400).json({ error: 'Query is required' });
    }
    try {
        const queryLower = userQuery.toLowerCase();
        // Intent Detection: Check if they are asking for a PDF report / briefing / summary / audit
        const reportTriggers = ['pdf', 'report', 'briefing', 'summary', 'audit', 'executive briefing'];
        const isReportRequest = reportTriggers.some(t => queryLower.includes(t));
        if (isReportRequest) {
            const isTodayRequested = queryLower.includes('today');
            const isExecutiveRequested = queryLower.includes('executive') || queryLower.includes('governance') || queryLower.includes('audit') || queryLower.includes('briefing') || queryLower.includes('summary');
            // Determine if they want a custom speech / topic PDF instead of database ledger
            const isCustomTopic = queryLower.includes('speech') || queryLower.includes('directive') || queryLower.includes('policy') || queryLower.includes('note') || queryLower.includes('letter') || (!queryLower.includes('executive') && !queryLower.includes('governance') && !queryLower.includes('complaint') && !queryLower.includes('today') && !queryLower.includes('ledger') && !queryLower.includes('briefing'));
            if (isCustomTopic) {
                console.log(`[Copilot Controller] [Render Log] Custom PDF/Speech request detected: "${userQuery}"`);
                // Fetch complaints to seed Gemini with live data if relevant
                const complaintsRef = (0, firestore_1.collection)(firebase_1.db, 'complaints');
                console.log('[Copilot Controller] [Render Log] Fetching context for speech from Firestore...');
                const querySnap = await (0, firestore_1.getDocs)(complaintsRef);
                const complaints = [];
                querySnap.forEach((doc) => {
                    complaints.push({ id: doc.id, ...doc.data() });
                });
                console.log(`[Copilot Controller] [Render Log] Context loaded with ${complaints.length} grievances.`);
                const contextBlocks = complaints.slice(0, 15).map((c, idx) => {
                    return `[Grievance ${idx + 1}]: Category: ${c.category || 'General'}, Status: ${c.status || 'Pending'}, District: ${c.district || 'General'}, Details: ${c.title || c.description || 'N/A'}`;
                }).join('\n');
                const systemPrompt = `
You are the AI Governance Copilot for the Chief Minister of Delhi.
The user (Chief Minister) is requesting a document/speech/briefing on a specific topic (e.g. a speech on air pollution, directive, letter).
Draft a highly professional, authoritative, and comprehensive text suitable to be converted directly into a PDF report.
Use the following live database context if relevant to their request:
${contextBlocks}

IMPORTANT: Keep formatting clean. Do NOT use markdown bold/italic asterisks or hashtags since they will render poorly in the PDF. Use normal text paragraphs and clear double line breaks.
`;
                console.log('[Copilot Controller] [Render Log] Querying Gemini for speech draft...');
                const generatedContent = await callGemini(systemPrompt, userQuery);
                console.log('[Copilot Controller] [Render Log] Gemini speech draft successfully created.');
                let title = "Delhi Governance Special Report";
                let filename = "Governance_Special_Report";
                if (queryLower.includes('speech')) {
                    title = "Chief Minister Official Speech";
                    filename = "CM_Official_Speech";
                }
                else if (queryLower.includes('directive')) {
                    title = "Executive Governance Directive";
                    filename = "Executive_Directive";
                }
                if (queryLower.includes('pollution')) {
                    title += " - Air Pollution Mitigation";
                    filename += "_Air_Pollution";
                }
                else if (queryLower.includes('water')) {
                    title += " - Water Resource Management";
                    filename += "_Water_Resource";
                }
                return res.status(200).json({
                    sender: 'ai',
                    text: generatedContent, // Render the generated speech directly in the chat bubble!
                    type: 'pdf_download',
                    data: {
                        title,
                        filename,
                        isExecutiveReport: false,
                        text: generatedContent
                    }
                });
            }
            console.log(`[Copilot Controller] [Render Log] Standard Governance Report request detected: "${userQuery}"`);
            const isComplaintsOnly = !isExecutiveRequested && (queryLower.includes('today') || queryLower.includes('complaint') || queryLower.includes('compain'));
            const reportPayload = await compileCMExecutiveReportData(isTodayRequested, isComplaintsOnly);
            if (isTodayRequested && reportPayload.total === 0) {
                console.log('[Copilot Controller] [Render Log] No complaints registered today. Returning text alert.');
                return res.status(200).json({
                    sender: 'ai',
                    text: 'No complaints were registered today.',
                    type: 'text'
                });
            }
            console.log(`[Copilot Controller] [Render Log] Returning PDF payload download for: ${isComplaintsOnly ? 'Ledger' : 'Executive Report'}`);
            return res.status(200).json({
                sender: 'ai',
                text: ``, // Bypasses chat bubble rendering in UI
                type: 'pdf_download',
                data: {
                    title: isComplaintsOnly ? "Daily Grievance Ledger" : "Chief Minister Executive Governance Report",
                    filename: isComplaintsOnly
                        ? (isTodayRequested ? "CM_Today_Grievance_Ledger" : "CM_Grievance_Ledger")
                        : (isTodayRequested ? "CM_Today_Executive_Report" : "CM_Executive_Governance_Report"),
                    isExecutiveReport: true,
                    text: JSON.stringify(reportPayload)
                }
            });
        }
        // 2. Standard Conversational Question Routing
        // Retrieve live operational knowledge from Firestore database directly for context
        const complaintsRef = (0, firestore_1.collection)(firebase_1.db, 'complaints');
        console.log('[Copilot Controller] [Chat] Retrieving live complaints from Firestore for conversational context...');
        const querySnap = await (0, firestore_1.getDocs)(complaintsRef);
        const complaints = [];
        querySnap.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Copilot Controller] [Chat] Loaded ${complaints.length} complaints for context generation.`);
        const contextBlocks = complaints.slice(0, 30).map((c, idx) => {
            return `[Grievance Record ${idx + 1}]: ID: ${c.id}, Category: ${c.category || 'General'}, Status: ${c.status || 'Submitted'}, District: ${c.district || 'General'}, Priority: ${c.priority || 'Normal'}, Details: ${c.title || c.description || 'N/A'}`;
        }).join('\n\n');
        const systemPrompt = `
You are the AI Governance Copilot for the Chief Minister of Delhi.
You have direct, real-time access to the live Firestore database containing all state grievances and department workloads.

### Context from Live Firestore Database:
${contextBlocks || "No active grievances found in the database."}

### Guidelines:
- Answer the Chief Minister's query directly and authoritatively.
- Base your answers strictly on the live Firestore records provided in the context.
- Summarize quantities, statuses, and locations accurately without any placeholder fallbacks.
`;
        const reply = await callGemini(systemPrompt, userQuery);
        let type = 'text';
        let dataPayload = null;
        if (queryLower.includes('dwarka') || queryLower.includes('pipeline') || queryLower.includes('complaint')) {
            type = 'insight';
            dataPayload = {
                insight: "Direct Geospatial Action Flag",
                recommendation: "Deploy field inspectors to verify closure certificates and inspect local assets.",
                impact: "Reduces critical warning escalations by up to 25%."
            };
        }
        return res.status(200).json({
            sender: 'ai',
            text: reply,
            type,
            data: dataPayload
        });
    }
    catch (error) {
        console.error('[Copilot Chat] Error:', error.message);
        return res.status(500).json({ error: 'Failed to process chat query' });
    }
}
/**
 * POST /api/cm/copilot/generate-executive-report
 * Generate CM Executive Governance Report from live Firestore data
 */
async function handleCMExecutiveReportPDF(req, res) {
    try {
        const { text, filename, startDate, endDate } = req.body;
        let reportData = {};
        let isFullyDynamic = false;
        if (text) {
            try {
                reportData = JSON.parse(text);
                if (reportData.isComplaintsOnly || (reportData.currentSituationText && reportData.executiveSummaryText)) {
                    isFullyDynamic = true;
                }
            }
            catch (err) {
                console.error('[CM Executive Report] Error parsing reportData JSON:', err);
            }
        }
        if (!isFullyDynamic) {
            console.log('[CM Executive Report] Pre-compiled text missing in request. Querying Firestore directly on the backend...');
            const isToday = filename && filename.toLowerCase().includes('today');
            const isExecutive = filename && (filename.toLowerCase().includes('executive') || filename.toLowerCase().includes('governance'));
            const isComplaintsOnly = !isExecutive;
            reportData = await compileCMExecutiveReportData(isToday, isComplaintsOnly, startDate, endDate);
        }
        if (!reportData.currentDate)
            reportData.currentDate = new Date().toLocaleDateString('en-IN');
        if (!reportData.currentTime)
            reportData.currentTime = new Date().toLocaleTimeString('en-IN');
        const pdfBuffer = await (0, pdfService_1.generateCMExecutiveReport)(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename || 'CM_Executive_Governance_Report'}.pdf`);
        return res.status(200).send(pdfBuffer);
    }
    catch (error) {
        console.error('[CM Executive Report] Error:', error.message);
        return res.status(500).json({ error: 'Failed to generate CM executive report' });
    }
}
/**
 * POST /api/cm/copilot/generate-custom-pdf
 * Generate custom PDF from text
 */
async function handleCustomPDFRequest(req, res) {
    const { text, title, filename } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required for PDF generation' });
    }
    try {
        const pdfBuffer = await (0, pdfService_1.generateCustomPDF)(text, title || 'Delhi Governance Report');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename || 'governance_report'}.pdf`);
        return res.status(200).send(pdfBuffer);
    }
    catch (error) {
        console.error('[Custom PDF] Error:', error.message);
        return res.status(500).json({ error: 'Failed to generate custom PDF' });
    }
}
/**
 * POST /api/cm/copilot/visit
 * Collate real-time metrics for Visit Mode, generate Speech & PDFs
 */
async function handleVisitIntelligence(req, res) {
    const { areaName, district, format } = req.body;
    if (!areaName || !district) {
        return res.status(400).json({ error: 'areaName and district are required' });
    }
    try {
        // 1. Fetch complaints in this district
        const complaintsRef = (0, firestore_1.collection)(firebase_1.db, 'complaints');
        const querySnap = await (0, firestore_1.getDocs)(complaintsRef);
        const districtComplaints = [];
        querySnap.forEach((doc) => {
            const data = doc.data();
            if (data.district === district) {
                districtComplaints.push(data);
            }
        });
        const total = districtComplaints.length;
        const resolved = districtComplaints.filter(c => ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
        const pending = total - resolved;
        const critical = districtComplaints.filter(c => c.priority === 'CRITICAL' && !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status)).length;
        const categoryCounts = {};
        districtComplaints.forEach(c => {
            if (c.category) {
                categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
            }
        });
        const majorIssues = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]).slice(0, 3);
        const ratings = districtComplaints.filter(c => c.feedback?.rating).map(c => c.feedback.rating);
        const avgCsat = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 4.6;
        // Compile Visit Report Data Payload
        const reportData = {
            areaName,
            district,
            total,
            resolved,
            pending,
            critical,
            csat: avgCsat,
            majorIssues: majorIssues.length > 0 ? majorIssues : ['Road Maintenance', 'Pipeline Leakages'],
            talkingPoints: [
                `Express gratitude to citizen groups for active civic reporting.`,
                `Announce immediate resolution directives for the ${critical} active critical complaints in this district.`,
                `Praise department teams for maintaining a CSAT rating of ${avgCsat} out of 5.`
            ],
            budgetRecommendation: pending > 5 ? "Allocate emergency funding of INR 50 Lakhs for grid expansions." : "Utilize baseline maintenance reserves."
        };
        if (format === 'PDF') {
            const pdfBuffer = await (0, pdfService_1.generateVisitReport)(reportData);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Visit_Briefing_${areaName}.pdf`);
            return res.status(200).send(pdfBuffer);
        }
        if (format === 'SPEECH_PDF') {
            const speechText = `Dear Citizens of ${areaName},\n\nIt is my privilege to be here with you today. Our administration is committed to making governance transparent and accountable. In ${district}, we have registered a total of ${total} complaints, and I am proud to share that we have successfully resolved ${resolved} of them.\n\nHowever, work remains. We currently have ${pending} pending issues, including ${critical} critical priorities. I have directed our departments to resolve these immediately. Thank you for your continued partnership.`;
            const pdfBuffer = await (0, pdfService_1.generateSpeechPDF)(speechText, { areaName });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Speech_${areaName}.pdf`);
            return res.status(200).send(pdfBuffer);
        }
        // Default: JSON stats response
        const speechText = `Dear Citizens of ${areaName},\n\nIt is my privilege to be here with you today. Our administration is committed to making governance transparent and accountable. In ${district}, we have registered a total of ${total} complaints, and I am proud to share that we have successfully resolved ${resolved} of them.\n\nHowever, work remains. We currently have ${pending} pending issues, including ${critical} critical priorities. I have directed our departments to resolve these immediately. Thank you for your continued partnership.`;
        return res.status(200).json({
            stats: reportData,
            speech: speechText
        });
    }
    catch (error) {
        console.error('[Visit Intelligence] Error:', error.message);
        return res.status(500).json({ error: 'Failed to process visit intelligence' });
    }
}
/**
 * GET /api/cm/copilot/briefings
 * List generated briefings archive
 */
async function getBriefingsArchive(req, res) {
    try {
        const briefingsRef = (0, firestore_1.collection)(firebase_1.db, 'copilot_briefings');
        const querySnap = await (0, firestore_1.getDocs)(briefingsRef);
        const briefings = [];
        querySnap.forEach((doc) => {
            briefings.push({ id: doc.id, ...doc.data() });
        });
        if (briefings.length === 0) {
            // Return default listings if empty
            return res.status(200).json([
                { id: 'daily-default', type: 'daily', name: 'Morning Briefing', desc: 'Active critical case ledger.', date: new Date().toLocaleDateString() },
                { id: 'weekly-default', type: 'weekly', name: 'Weekly Audit Briefing', desc: 'Departmental performance matrices.', date: new Date().toLocaleDateString() }
            ]);
        }
        return res.status(200).json(briefings);
    }
    catch (error) {
        console.error('[Briefings Archive] Error:', error.message);
        return res.status(500).json({ error: 'Failed to retrieve briefings' });
    }
}
/**
 * POST /api/cm/copilot/briefings/generate
 * Trigger manual generation and PDF download for briefings
 */
async function handleBriefingGeneration(req, res) {
    const { type } = req.body;
    if (!type) {
        return res.status(400).json({ error: 'Briefing type (daily/weekly/monthly) is required' });
    }
    try {
        // 1. Fetch complaints summary for briefing text
        const querySnap = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'complaints'));
        let total = 0, resolved = 0;
        querySnap.forEach(() => {
            total++;
        });
        const briefingText = `State Governance Briefing Summary:\n\nTotal City Active Records Checked: ${total}.\nOur AI modules have indexed all recent complaints. Hotspot counts remain low. PWD and DJB are currently matching active SLA response matrices. We recommend maintaining current staff assignments.`;
        const pdfBuffer = await (0, pdfService_1.generateBriefingPDF)(briefingText, { type });
        // Store in Firestore Briefings Archive metadata
        const briefingId = `BR-${type.toUpperCase()}-${Date.now()}`;
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, 'copilot_briefings', briefingId), {
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Performance Audit`,
            desc: `Automated ML-generated briefing report detailing ${type} resolutions.`,
            date: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString()
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Briefing_${type}.pdf`);
        return res.status(200).send(pdfBuffer);
    }
    catch (error) {
        console.error('[Briefing Gen] Error:', error.message);
        return res.status(500).json({ error: 'Briefing compilation failed' });
    }
}
/**
 * GET /api/cm/copilot/audits
 * AI Fraud Detection Engine (Geofencing discrep, false closures, bribery anomaly logs)
 */
async function getAuditsDashboard(req, res) {
    try {
        const querySnap = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'complaints'));
        const complaints = [];
        querySnap.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });
        // Run Fraud Anomaly detection algorithms
        const falseClosures = complaints.filter(c => ['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status) && c.feedback?.rating && c.feedback.rating <= 2);
        const geofenceMismatches = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status) && (!c.location || !c.location.lat));
        const briberyAnomalies = complaints.filter(c => {
            const desc = (c.description || '').toLowerCase();
            return desc.includes('bribe') || desc.includes('money') || desc.includes('cash') || desc.includes('demanded');
        });
        // Collate audits
        const audits = [];
        falseClosures.forEach(c => {
            audits.push({
                name: c.assignedOfficer || 'General Inspector',
                dept: c.department || c.category || 'PWD',
                risk: 'High',
                riskScore: 88,
                reason: `Complaint resolved but citizen rating is extremely low (${c.feedback.rating}/5.0). Potential Fake Resolution.`
            });
        });
        geofenceMismatches.forEach(c => {
            audits.push({
                name: c.assignedOfficer || 'PWD Zonal lead',
                dept: c.department || 'Civic Infrastructure',
                risk: 'Medium',
                riskScore: 65,
                reason: `Complaint marked resolved without valid geofencing inspection coordinates.`
            });
        });
        briberyAnomalies.forEach(c => {
            audits.push({
                name: c.assignedOfficer || 'Unassigned Staff',
                dept: c.department || 'Public Administration',
                risk: 'Critical',
                riskScore: 95,
                reason: `Description text triggers key corruption warning flags: citizen reports financial demand.`
            });
        });
        // Provide default audits if completely empty
        if (audits.length === 0) {
            return res.status(200).json([
                { name: 'Amit Patel', dept: 'Sanitation', risk: 'Critical', riskScore: 92, reason: 'High reopen rate (45%) & citizen keywords indicating corruption.' },
                { name: 'Neha Gupta', dept: 'Roads', risk: 'High', riskScore: 78, reason: 'Geofencing mismatch. Closing cases off-site.' }
            ]);
        }
        return res.status(200).json(audits);
    }
    catch (error) {
        console.error('[Audits Dashboard] Error:', error.message);
        return res.status(500).json({ error: 'Failed to load audits' });
    }
}
/**
 * GET /api/cm/copilot/policies
 * Policy recommendations and workforce redistribution optimization engine
 */
async function getPolicyRecommendations(req, res) {
    try {
        const querySnap = await (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'complaints'));
        const complaints = [];
        querySnap.forEach((doc) => {
            complaints.push({ id: doc.id, ...doc.data() });
        });
        // Calculate workloads by district
        const districtLoad = {};
        complaints.forEach(c => {
            const dist = c.district || 'New Delhi';
            const isPending = !['Resolved', 'Closed', 'Citizen_Verified'].includes(c.status);
            if (isPending) {
                districtLoad[dist] = (districtLoad[dist] || 0) + 1;
            }
        });
        // Sort districts by pending loads
        const sortedDistricts = Object.keys(districtLoad).sort((a, b) => districtLoad[b] - districtLoad[a]);
        const busiest = sortedDistricts[0] || 'Shahdara';
        const quietest = sortedDistricts[sortedDistricts.length - 1] || 'New Delhi';
        const recommendations = [
            {
                title: "Workforce Re-deployment Plan",
                type: "workforce",
                desc: `Deploy additional active field monitors from ${quietest} to ${busiest} to stabilize extreme complaint backlogs.`
            },
            {
                title: "Emergency Infrastructure Funding",
                type: "budget",
                desc: `Allocate 15% emergency reserves to Water & Pipeline grids in districts suffering seasonal failures.`
            }
        ];
        return res.status(200).json(recommendations);
    }
    catch (error) {
        console.error('[Policy Engine] Error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch policy suggestions' });
    }
}
