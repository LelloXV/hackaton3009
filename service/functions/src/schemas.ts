// Input validation for every callable function (Aikido / SAST: never trust client input).
import { z } from "zod";

const countryCode = z.string().regex(/^([A-Z]{2}|ALL)$/, "Use an ISO country code like BE, or ALL");
const shortText = (max: number) => z.string().trim().min(1).max(max);

export const ownerSchema = z.object({
  name: shortText(100),
  team: shortText(100),
  contact: z.email().max(200),
});

export const ingestSchema = z.object({
  title: z.string().trim().min(3).max(200),
  text: z.string().trim().min(20).max(50_000),
  sourceType: z.enum(["policy", "procedure", "email", "teams_chat"]),
  owner: ownerSchema.nullable(),
  lastEditedAt: z.iso.datetime(),
  lastVerifiedAt: z.iso.datetime().nullable(),
  reviewIntervalDays: z.number().int().min(1).max(730).default(180),
  scope: z.object({
    countries: z.array(countryCode).min(1).max(50),
    clients: z.array(shortText(100)).max(50).default([]),
    modules: z.array(z.enum(["HR", "Pay", "Time"])).max(3).default([]),
  }),
});

export const askSchema = z.object({
  question: z.string().trim().min(5).max(500),
  country: z.string().regex(/^[A-Z]{2}$/).optional(),
  client: shortText(100).optional(),
});

export const verifySchema = z.object({
  passportId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
});

export type IngestInput = z.infer<typeof ingestSchema>;
export type AskInput = z.infer<typeof askSchema>;
