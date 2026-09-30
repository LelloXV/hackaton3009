// Input validation for every callable function (Aikido / SAST: never trust client input).
// The passport shape mirrors schemas/passport.schema.json (v1.1.0).
import { z } from "zod";

const identifier = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/);
const timestamp = z.iso.datetime();
const httpsUri = z.url().max(2048).regex(/^https:\/\//);
const text = (max: number) => z.string().trim().min(1).max(max);

const actor = z.strictObject({ id: identifier, name: text(500), type: z.enum(["person", "team", "system"]) });

function scope<T extends z.ZodType<string>>(value: T) {
  return z
    .strictObject({ mode: z.enum(["listed", "all", "unknown"]), values: z.array(value) })
    .refine((s) => (s.mode === "listed" ? s.values.length > 0 : s.values.length === 0), {
      message: "listed needs values; all and unknown need an empty list",
    });
}

const sourceType = z.enum(["project", "document", "chat", "email", "business_record", "expert_note", "generated_answer"]);
const country = z.string().regex(/^[A-Z]{2}$/);

export const passportSchema = z.strictObject({
  schemaVersion: z.literal("1.1.0"),
  id: identifier,
  reference: text(50).nullable(),
  title: text(500),
  description: text(1000),
  issuer: actor,
  owner: actor.nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  updatedBy: actor.nullable(),
  lastVerifiedAt: timestamp.nullable(),
  expiresAt: timestamp.nullable(),
  visa: z.strictObject({
    countries: scope(country),
    clients: scope(identifier),
    modules: scope(z.enum(["hr", "pay", "time"])),
  }),
  departments: z.array(text(200)).max(50),
  sourceType,
  source: z.strictObject({ id: identifier, uri: httpsUri }),
  version: z.number().int().min(1),
  stamps: z.array(
    z.strictObject({
      id: identifier,
      type: z.enum(["verified", "conflict", "conflict_resolved", "revoked", "note"]),
      at: timestamp,
      actor,
      version: z.number().int().min(1),
      note: text(2000),
      relatedStampIds: z.array(identifier),
    }),
  ),
  linkedSources: z.array(
    z.strictObject({
      id: identifier,
      title: text(500),
      sourceType,
      app: text(100).nullable(),
      version: text(50).nullable(),
      updatedAt: timestamp.nullable(),
      countries: z.array(country),
      uri: httpsUri,
      relation: z.enum(["supports", "contradicts", "derived_from", "supersedes"]),
    }),
  ),
  openIssues: z.array(
    z.strictObject({ id: identifier, title: text(500), severity: z.enum(["minor", "major"]), openedAt: timestamp }),
  ),
  updates: z.array(
    z.strictObject({ version: z.number().int().min(1), at: timestamp, actor, summary: text(2000) }),
  ),
  related: z.array(z.strictObject({ passportId: identifier, title: text(500), relation: text(200) })),
});

export const ingestSchema = z.strictObject({
  passport: passportSchema,
  // Text of each linked source, keyed by linkedSources[].id. Used for search and the AI chat.
  sourceTexts: z.record(identifier, z.string().trim().min(1).max(50_000)),
});

export const askSchema = z.strictObject({
  question: z.string().trim().min(5).max(500),
  country: country.optional(),
  client: identifier.optional(),
});

export const passportIdSchema = z.strictObject({ passportId: identifier });

export const askAiSchema = z.strictObject({
  passportId: identifier,
  message: z.string().trim().min(2).max(500),
});

export type IngestInput = z.infer<typeof ingestSchema>;
export type AskInput = z.infer<typeof askSchema>;
