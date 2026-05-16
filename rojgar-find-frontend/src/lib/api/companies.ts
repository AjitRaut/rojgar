import { api } from "./client";
import type { CompanyProfile } from "@/types/api";

export interface CompanyProfileUpdate {
  company_name?: string;
  company_type?: string;
  gst_number?: string;
  registration_number?: string;
  website?: string;
  description?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
}

export const companiesApi = {
  getMe: () => api.get<CompanyProfile>("/companies/me").then((r) => r.data),
  updateMe: (payload: CompanyProfileUpdate) =>
    api.patch<CompanyProfile>("/companies/me", payload).then((r) => r.data),
};
