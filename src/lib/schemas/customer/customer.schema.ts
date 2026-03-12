import { z } from "zod";

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  industry: z.string().min(1, "Industry is required").max(100),
  contactEmail: z.email("Invalid email address"),
  contactPhone: z.string().min(1, "Phone number is required").max(30),
});

export type CreateCustomerFormData = z.infer<typeof CreateCustomerSchema>;
