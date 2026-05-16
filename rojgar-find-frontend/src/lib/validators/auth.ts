import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Name is too short").max(150),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Phone must be 10+ digits")
    .max(20)
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "Min 6 characters").max(128),
  role: z.enum(["customer", "worker", "company"], {
    errorMap: () => ({ message: "Choose a role" }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
