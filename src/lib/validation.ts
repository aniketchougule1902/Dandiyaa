import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  college: z.enum(["pccoe", "dyp"]),
  year: z.coerce.number().int().min(1).max(6),
  contact: z.string().trim().min(6).max(120),
  socialHandle: z.string().trim().max(100).optional().default(""),
  prn: z.string().trim().min(3).max(80),
  preference: z.enum(["senior", "junior", "same_year", "any"]),
  age18: z.literal(true),
  matchConsent: z.literal(true),
  privacyConsent: z.literal(true),
  nonAffiliationAcknowledged: z.literal(true),
  website: z.string().max(0).optional().default("")
});

export const matchLookupSchema = z.object({
  token: z.string().uuid()
});

export const matchResponseSchema = z.object({
  token: z.string().uuid(),
  action: z.enum(["accept", "reject", "block", "report"]),
  reason: z.string().trim().max(500).optional()
});

export const adminLoginSchema = z.object({
  password: z.string().min(1)
});

export const eventUpdateSchema = z.object({
  registrationClosesAt: z.string().datetime(),
  title: z.string().trim().min(2).max(100).default("Dandiyaa Night")
});
