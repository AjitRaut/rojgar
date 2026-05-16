export const APP_NAME = "Rojgar Find";
export const APP_TAGLINE = "Find Daily Jobs · Hire Local Workers";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_PREFIX = "/api/v1";

export const ROLES = {
  CUSTOMER: "customer",
  WORKER: "worker",
  COMPANY: "company",
  ADMIN: "admin",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  worker: "Worker",
  company: "Company",
  admin: "Admin",
};

export const JOB_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Masonry",
  "Cleaning",
  "Loading",
  "Electronics Repair",
  "Gardening",
  "Cooking",
  "Driving",
  "Security",
  "Tailoring",
  "General Labor",
];

export const JOB_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "closed", label: "Closed" },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "rf_access_token",
  REFRESH_TOKEN: "rf_refresh_token",
  USER: "rf_user",
} as const;

export const QUERY_KEYS = {
  me: ["me"] as const,
  workers: (filters?: unknown) => ["workers", filters] as const,
  worker: (id: number) => ["worker", id] as const,
  workerMe: ["worker", "me"] as const,
  jobs: (filters?: unknown) => ["jobs", filters] as const,
  job: (id: number) => ["job", id] as const,
  myPostedJobs: ["jobs", "my", "posted"] as const,
  myApplications: ["jobs", "my", "applications"] as const,
  jobApplications: (jobId: number) => ["job", jobId, "applications"] as const,
  companyMe: ["company", "me"] as const,
  reviewsForUser: (userId: number) => ["reviews", "user", userId] as const,
  myComplaints: ["complaints", "me"] as const,
  adminUsers: (filters?: unknown) => ["admin", "users", filters] as const,
  adminComplaints: ["admin", "complaints"] as const,
  adminAnalytics: ["admin", "analytics"] as const,
} as const;
