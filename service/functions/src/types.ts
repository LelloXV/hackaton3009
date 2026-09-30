// Shared types for the trust passport backend.

export type SourceType = "policy" | "procedure" | "email" | "teams_chat";
export type Module = "HR" | "Pay" | "Time";

export interface Owner {
  name: string;
  team: string;
  contact: string; // email, used to authorise the owner to verify the source
}

export interface Scope {
  countries: string[]; // ISO codes like "BE", or "ALL"
  clients: string[]; // empty = applies to every client
  modules: Module[];
}

/** The passport: metadata that tells a reader whether a source can be trusted. */
export interface Passport {
  id: string;
  title: string;
  sourceType: SourceType;
  owner: Owner | null;
  lastEditedAt: string; // ISO date
  lastVerifiedAt: string | null; // ISO date; "edited" is NOT "verified"
  reviewIntervalDays: number; // verification expires after this
  scope: Scope;
  sha256: string; // fingerprint of the content (integrity + duplicate detection)
  ingestedAt: string;
  ingestedBy: string;
}

export interface Chunk {
  passportId: string;
  position: number;
  text: string;
  terms: string[]; // normalised keywords, used for retrieval
}

export type VerificationStatus =
  | "verified"
  | "expired"
  | "changed_since_verification"
  | "unverified";

export interface ScoredSource {
  passportId: string;
  title: string;
  sourceType: SourceType;
  owner: Owner | null;
  verificationStatus: VerificationStatus;
  inScope: boolean;
  scopeNote: string | null;
  score: number; // 0-100
  breakdown: Record<string, number>; // points per factor, so the score is explainable
  reasons: string[]; // human-readable "+ / -" reasons
  excerpt: string;
  claim: string | null; // key figure found in the excerpt (e.g. "92%")
}

export interface Conflict {
  topic: string;
  leadingClaim: string;
  positions: { claim: string; passportIds: string[]; support: number }[]; // support = combined trust score
  resolveWith: Owner | null;
}

export interface AskResult {
  answer: string | null;
  confidence: "high" | "medium" | "low" | "none";
  topSourceId: string | null;
  sources: ScoredSource[];
  conflicts: Conflict[];
  uncertainty: string[];
  whoToContact: Owner | null;
}
