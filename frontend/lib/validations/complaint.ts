import * as z from "zod";

export const complaintSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Please provide a detailed description (min 20 chars)." }),
  category: z.string().min(1, { message: "Please select a category." }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  district: z.string().min(1, { message: "Please select your district." }),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
  isAnonymous: z.boolean(), // Removed .default(false) to fix TS error
});

export type ComplaintFormValues = z.infer<typeof complaintSchema>;

export const CATEGORIES = [
  "Water Supply", "Electricity", "Roads & Traffic", 
  "Sanitation & Waste", "Public Health", "Law & Order", "Other"
];

export const DISTRICTS = [
  "Central Delhi", "East Delhi", "New Delhi", "North Delhi", 
  "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", 
  "South East Delhi", "South West Delhi", "West Delhi"
];