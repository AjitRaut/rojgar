import { z } from "zod";

export const jobCreateSchema = z.object({
  title: z.string().min(3, "Title is too short").max(200),
  description: z.string().min(10, "Description is too short"),
  category: z.string().min(2, "Choose a category").max(100),
  skills_required: z.array(z.string()).default([]),
  workers_needed: z.coerce.number().int().min(1).max(500).default(1),
  daily_wage: z.coerce.number().positive("Daily wage must be > 0"),
  duration_days: z.coerce.number().int().min(1).max(365).default(1),
  city: z.string().min(2, "City required").max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  pincode: z.string().max(10).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  is_urgent: z.boolean().default(false),
});

export type JobCreateInput = z.infer<typeof jobCreateSchema>;

export const workerProfileSchema = z.object({
  primary_skill: z.string().max(100).optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  experience_years: z.coerce.number().int().min(0).max(80).default(0),
  daily_rate: z.coerce.number().min(0).optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
  bio: z.string().optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  pincode: z.string().max(10).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  is_available: z.boolean().default(true),
});

export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;

export const companyProfileSchema = z.object({
  company_name: z.string().min(2).max(200),
  company_type: z.string().max(100).optional().or(z.literal("")),
  gst_number: z.string().max(50).optional().or(z.literal("")),
  registration_number: z.string().max(100).optional().or(z.literal("")),
  website: z.string().max(300).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  pincode: z.string().max(10).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
