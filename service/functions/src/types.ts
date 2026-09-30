// Shared types for the knowledge passport backend.
// Passports follow docs/passport-contract.md (v1.1.0); keep the two in sync.

export type ActorType = "person" | "team" | "system";

export interface Actor {
  id: string;
  name: string;
  type: ActorType;
}

export type ScopeMode = "listed" | "all" | "unknown";

export interface ScopeDimension<T extends string = string> {
  mode: ScopeMode;
  values: T[]; // non-empty only when mode is "listed"
}

export type Module = "hr" | "pay" | "time";

export interface Visa {
  countries: ScopeDimension; // ISO 3166-1 alpha-2, e.g. "BE"
  clients: ScopeDimension; // stable client IDs
  modules: ScopeDimension<Module>;
}

export type SourceType =
  | "project"
  | "document"
  | "chat"
  | "email"
  | "business_record"
  | "expert_note"
  | "generated_answer";

export type StampType = "verified" | "conflict" | "conflict_resolved" | "revoked" | "note";

export interface Stamp {
  id: string;
  type: StampType;
  at: string;
  actor: Actor;
  version: number;
  note: string;
  relatedStampIds: string[];
}

export type Relation = "supports" | "contradicts" | "derived_from" | "supersedes";

export interface LinkedSource {
  id: string;
  title: string;
  sourceType: SourceType;
  app: string | null; // tool the source lives in, e.g. "SharePoint"
  version: string | null;
  updatedAt: string | null;
  countries: string[]; // countries this source covers ([] = not stated)
  uri: string;
  relation: Relation;
}

export interface OpenIssue {
  id: string;
  title: string;
  severity: "minor" | "major";
  openedAt: string;
}

export interface PassportUpdate {
  version: number;
  at: string;
  actor: Actor;
  summary: string; // what changed compared to the previous version
}

export interface RelatedPassport {
  passportId: string;
  title: string;
  relation: string;
}

/** The passport of a project: who owns it, what it applies to and how it can be trusted. */
export interface Passport {
  schemaVersion: "1.1.0";
  id: string;
  reference: string | null;
  title: string;
  description: string;
  issuer: Actor;
  owner: Actor | null; // a team, so work continues when people leave
  createdAt: string;
  updatedAt: string;
  updatedBy: Actor | null;
  lastVerifiedAt: string | null;
  expiresAt: string | null; // relevant until; afterwards the passport is archived
  visa: Visa;
  departments: string[];
  sourceType: SourceType;
  source: { id: string; uri: string };
  version: number;
  stamps: Stamp[];
  linkedSources: LinkedSource[];
  openIssues: OpenIssue[];
  updates: PassportUpdate[];
  related: RelatedPassport[];
}

/** Team directory entry (application data, not part of the passport). */
export interface Team {
  id: string;
  name: string;
  lead: { id: string; name: string; email: string };
  members: { id: string; name: string; email: string }[];
  expertise: string[];
}

/** Searchable piece of a linked source's text. */
export interface Chunk {
  passportId: string;
  linkedSourceId: string;
  position: number;
  text: string;
  terms: string[];
}

export type CriterionStatus = "ok" | "partial" | "stale" | "missing" | "conflict";
export type Level = "high" | "medium" | "low";

export interface Criterion {
  id:
    | "sources_agree"
    | "last_updated"
    | "owner_unit"
    | "scope_coverage"
    | "owner_review"
    | "department_defined"
    | "open_issues";
  label: string;
  maxPoints: number;
  points: number;
  status: CriterionStatus;
  details: string;
}

/** Computed on request, never stored in the passport. */
export interface Trust {
  score: number; // 0-100, sum of criteria points
  level: Level;
  criteria: Criterion[];
}

export interface PassportView {
  passport: Passport;
  trust: Trust;
  archived: boolean;
  canEdit: boolean; // the signed-in user is in the owning team (the backend still checks on every change)
}

export interface Me {
  uid: string;
  name: string;
  email: string;
  emailVerified: boolean;
  teams: { id: string; name: string }[];
}

export interface Contact {
  id: string;
  name: string;
  unit: string;
  contact: string;
  expertise: string[];
}

export interface AskResultItem extends PassportView {
  ref: number; // [ref] in the answer text
  passportId: string;
  excerpt: string;
  inScope: boolean;
  scopeNote: string | null;
}

export interface Evidence {
  passportId: string; // passport to open for this source
  passportIds: string[]; // every matching passport that links this source
  linkedSourceId: string;
  title: string;
  app: string | null;
  date: string | null;
  excerpt: string;
}

export interface Conflict {
  id: string;
  topic: string;
  leadingClaim: string;
  positions: { claim: string; support: number; evidence: Evidence[] }[];
  difference: string;
  resolveWith: (Contact & { reason: string }) | null;
}

export interface AskResult {
  question: string;
  context: { country: string | null; client: string | null };
  answer: string | null;
  confidence: Level | "none";
  results: AskResultItem[]; // active passports, best first
  archived: AskResultItem[]; // matched but archived: shown, never used for the answer
  conflicts: Conflict[];
  uncertainty: string[];
  whoToContact: Contact | null;
}

export interface AiAnswer {
  answer: string;
  citations: { id: string; title: string }[]; // linked sources the answer is based on
}
