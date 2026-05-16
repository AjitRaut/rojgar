// Role types
export type UserRole = "customer" | "worker" | "company" | "admin";

export type JobStatus = "open" | "in_progress" | "completed" | "cancelled" | "closed";
export type ApplicationStatus = "applied" | "accepted" | "rejected" | "withdrawn";
export type ComplaintStatus = "open" | "in_review" | "resolved" | "rejected";
export type ReviewType = "customer_to_worker" | "worker_to_customer";
export type SubscriptionTier = "free" | "pro" | "enterprise";

// User
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  profile_image?: string | null;
  language_pref: string;
  is_verified: boolean;
  is_active: boolean;
}

// Auth
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Worker
export interface WorkerProfile {
  id: number;
  user_id: number;
  skills: string[];
  primary_skill?: string | null;
  experience_years: number;
  hourly_rate?: number | null;
  daily_rate?: number | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address?: string | null;
  is_available: boolean;
  is_aadhaar_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  total_jobs_completed: number;
}

export interface WorkerPublic {
  id: number;
  user_id: number;
  full_name: string;
  profile_image?: string | null;
  primary_skill?: string | null;
  skills: string[];
  experience_years: number;
  daily_rate?: number | null;
  hourly_rate?: number | null;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  is_available: boolean;
  is_aadhaar_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  total_jobs_completed: number;
}

// Company
export interface CompanyProfile {
  id: number;
  user_id: number;
  company_name: string;
  company_type?: string | null;
  gst_number?: string | null;
  registration_number?: string | null;
  website?: string | null;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address?: string | null;
  is_gst_verified: boolean;
  subscription_tier: SubscriptionTier;
}

// Job
export interface Job {
  id: number;
  posted_by_id: number;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  workers_needed: number;
  daily_wage: number;
  total_budget?: number | null;
  duration_days: number;
  city: string;
  state?: string | null;
  pincode?: string | null;
  address?: string | null;
  start_date?: string | null;
  status: JobStatus;
  is_urgent: boolean;
  created_at: string;
  poster?: { id: number; full_name: string; role: string } | null;
}

export interface JobApplication {
  id: number;
  job_id: number;
  worker_id: number;
  status: ApplicationStatus;
  cover_message?: string | null;
  proposed_rate?: number | null;
  created_at: string;
}

// Review
export interface Review {
  id: number;
  job_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string | null;
  review_type: ReviewType;
  created_at: string;
}

// Complaint
export interface Complaint {
  id: number;
  raised_by_id: number;
  against_id?: number | null;
  job_id?: number | null;
  subject: string;
  description: string;
  status: ComplaintStatus;
  admin_response?: string | null;
  created_at: string;
}

// Generic pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// AI
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
}

export interface JobCategorizeResponse {
  category: string;
  suggested_skills: string[];
  suggested_title: string;
}

export interface WageSuggestResponse {
  suggested_daily_wage: number;
  min_wage: number;
  max_wage: number;
  reasoning: string;
}

export interface ProfileOptimizeResponse {
  suggestions: string[];
  improved_bio: string;
}

export interface RecommendedWorker {
  worker_id: number;
  full_name: string;
  primary_skill?: string | null;
  city?: string | null;
  rating_avg: number;
  match_score: number;
  match_reason: string;
}

export interface WorkerRecommendResponse {
  workers: RecommendedWorker[];
}

// Admin
export interface AdminAnalytics {
  users: { total: number; workers: number; customers: number; companies: number };
  jobs: { total: number; open: number; in_progress: number; completed: number };
  complaints: { open: number };
  verifications: { pending: number };
}

export interface AdminUserListItem {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
}
