export const TEMPLATES: Record<string, string> = {
  // Submission
  'complaint-submitted': 
    'Dear Citizen,\nYour grievance has been successfully submitted.\nComplaint ID: {{complaintId}}\nCategory: {{category}}\nStatus: Submitted\nThank you for using the CM Grievance Portal.',
  
  // Statuses
  'Submitted': 
    'Dear Citizen,\nYour grievance has been successfully submitted.\nComplaint ID: {{complaintId}}\nCategory: {{category}}\nStatus: Submitted\nThank you for using the CM Grievance Portal.',
  
  'AI_Validated': 
    'Dear Citizen,\nYour grievance {{complaintId}} has completed AI validation.\nStatus: AI Verified.\nThank you for using the CM Portal.',
  
  'Assigned_Dept': 
    'Dear Citizen,\nYour grievance {{complaintId}} has been assigned to {{department}}.',
  
  'Officer_Assigned': 
    'Dear Citizen,\nA resolving officer has been assigned to handle your grievance {{complaintId}}.',
  
  'Investigation_Started': 
    'Dear Citizen,\nInvestigation has started for grievance {{complaintId}}.',
  
  'Inspection_Scheduled': 
    'Dear Citizen,\nA field inspection has been scheduled for grievance {{complaintId}}.',
  
  'Inspection_Completed': 
    'Dear Citizen,\nField inspection has been completed for grievance {{complaintId}}.',
  
  'Action_In_Progress': 
    'Dear Citizen,\nWork has started on grievance {{complaintId}}.',
  
  'Resolved': 
    'Dear Citizen,\nYour grievance {{complaintId}} has been marked as resolved.',
  
  'Citizen_Verified': 
    'Dear Citizen,\nYou have successfully verified the resolution of grievance {{complaintId}}.',
  
  'Closed': 
    'Dear Citizen,\nYour grievance {{complaintId}} has been successfully closed.'
};

/**
 * Returns a compiled message string with replaced placeholders.
 */
export function renderTemplate(templateName: string, variables: Record<string, string>): string {
  const template = TEMPLATES[templateName] || TEMPLATES['Submitted'];
  let message = template;

  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }

  return message;
}
