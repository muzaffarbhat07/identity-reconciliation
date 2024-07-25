import { z } from "zod";

export const identityRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(1, "Invalid phone number"),
  })
  .partial()
  .refine((data) => data.email || data.phoneNumber, {
    message: "Please provide either email or phoneNumber or both",
  }),
});

export type IdentityRequest = z.infer<typeof identityRequestSchema>['body'];
