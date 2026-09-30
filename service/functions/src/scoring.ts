// Trust scoring: turns passports + retrieved chunks into ranked, explained sources.
// Pure functions (no Firebase) so they are easy to test and to explain to the judges.
import { AskResult, Chunk, Conflict, Owner, Passport, ScoredSource, SourceType, VerificationStatus } from "./types";
import { extractClaim, terms } from "./text";

const DAY = 24 * 60 * 60 * 1000;

// Maximum points per factor (total 100). Tune these, but keep them visible.
export const WEIGHTS = {
  relevance: 30,
  verification: 25,
  owner: 15,
  sourceType: 15,
  agreement: 15,
} as const;

const SOURCE_TYPE_POINTS: Record<SourceType, number> = {
  policy: 1,
  procedure: 0.8,
  email: 0.4,
  teams_chat: 0.25,
};

export function verificationStatus(p: Passport, now: Date): VerificationStatus {
  if (!p.lastVerifiedAt) return "unverified";
  const verified = new Date(p.lastVerifiedAt).getTime();
  if (new Date(p.lastEditedAt).getTime() > verified) return "changed_since_verification";
  if (now.getTime() - verified > p.reviewIntervalDays * DAY) return "expired";
  return "verified";
}

const VERIFICATION_POINTS: Record<VerificationStatus, number> = {
  verified: 1,
  expired: 0.4,
  changed_since_verification: 0.2, // the recent change itself is unverified
  unverified: 0,
};

function scopeCheck(p: Passport, country?: string, client?: string): { inScope: boolean; note: string | null } {
  const countries = p.scope.countries;
  if (country && !countries.includes("ALL") && !countries.includes(country)) {
    return { inScope: false, note: `Applies to ${countries.join(", ")}, not ${country}` };
  }
  if (client && p.scope.clients.length > 0 && !p.scope.clients.includes(client)) {
    return { inScope: false, note: `Written for client(s) ${p.scope.clients.join(", ")}` };
  }
  return { inScope: true, note: null };
}

function daysAgo(iso: string, now: Date): number {
  return Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / DAY));
}

interface Query {
  question: string;
  country?: string;
  client?: string;
}

export function rankSources(passports: Passport[], chunks: Chunk[], q: Query, now = new Date()): AskResult {
  const qTerms = terms(q.question);

  // 1. Best chunk per source (keyword relevance, 0..1).
  const best = new Map<string, { chunk: Chunk; relevance: number }>();
  for (const c of chunks) {
    const hits = qTerms.filter((t) => c.terms.includes(t)).length;
    const relevance = qTerms.length ? hits / qTerms.length : 0;
    const prev = best.get(c.passportId);
    if (relevance > 0 && (!prev || relevance > prev.relevance)) best.set(c.passportId, { chunk: c, relevance });
  }

  // 2. Base scores + reasons.
  const scored: ScoredSource[] = [];
  for (const p of passports) {
    const hit = best.get(p.id);
    if (!hit) continue;
    const status = verificationStatus(p, now);
    const scope = scopeCheck(p, q.country, q.client);
    const breakdown = {
      relevance: Math.round(hit.relevance * WEIGHTS.relevance),
      verification: Math.round(VERIFICATION_POINTS[status] * WEIGHTS.verification),
      // An informal source's "owner" is just its author, so it earns half the points.
      owner: p.owner ? (isInformal(p.sourceType) ? Math.round(WEIGHTS.owner / 2) : WEIGHTS.owner) : 0,
      sourceType: Math.round(SOURCE_TYPE_POINTS[p.sourceType] * WEIGHTS.sourceType),
      agreement: 0, // filled in step 3
    };
    const reasons: string[] = [];
    if (!scope.inScope) reasons.push(`− Out of scope: ${scope.note}`);
    if (status === "verified") reasons.push(`+ Verified ${daysAgo(p.lastVerifiedAt!, now)} days ago`);
    if (status === "unverified") reasons.push("− Never verified");
    if (status === "expired") reasons.push(`− Verification expired (last ${daysAgo(p.lastVerifiedAt!, now)} days ago)`);
    if (status === "changed_since_verification")
      reasons.push(`− Edited ${daysAgo(p.lastEditedAt, now)} days ago, after its last verification`);
    if (!p.owner) reasons.push("− No owner");
    else reasons.push(`+ ${isInformal(p.sourceType) ? "Author" : "Owner"}: ${p.owner.name} (${p.owner.team})`);
    if (isInformal(p.sourceType))
      reasons.push(`− Informal source (${p.sourceType.replace("_", " ")})`);
    else reasons.push(`+ Official ${p.sourceType}`);

    scored.push({
      passportId: p.id,
      title: p.title,
      sourceType: p.sourceType,
      owner: p.owner,
      verificationStatus: status,
      inScope: scope.inScope,
      scopeNote: scope.note,
      score: 0,
      breakdown,
      reasons,
      excerpt: hit.chunk.text,
      claim: extractClaim(hit.chunk.text),
    });
  }

  // 3. Agreement + conflicts, only among in-scope sources.
  const inScope = scored.filter((s) => s.inScope);
  const byClaim = new Map<string, ScoredSource[]>();
  for (const s of inScope) {
    if (!s.claim) continue;
    byClaim.set(s.claim, [...(byClaim.get(s.claim) ?? []), s]);
  }
  const withClaim = inScope.filter((s) => s.claim).length;
  for (const s of inScope) {
    if (!s.claim || withClaim < 2) continue;
    const agreeing = byClaim.get(s.claim)!.length - 1;
    s.breakdown.agreement = Math.round((agreeing / (withClaim - 1)) * WEIGHTS.agreement);
    if (agreeing > 0) s.reasons.push(`+ ${agreeing} other source(s) say the same (${s.claim})`);
    else s.reasons.push(`− No other source confirms ${s.claim}`);
  }

  for (const s of scored) {
    const total = Object.values(s.breakdown).reduce((a, b) => a + b, 0);
    s.score = s.inScope ? total : Math.round(total * 0.3); // out-of-scope sources sink but stay visible
  }

  // When sources conflict, a single source can't win on its own score: the position with the
  // most combined trust leads, and both positions are shown. This stops one unverified edit
  // from silently overriding what several other sources say.
  const conflicts: Conflict[] = [];
  let leadingClaim: string | null = null;
  if (byClaim.size > 1) {
    const positions = [...byClaim.entries()]
      .map(([claim, ss]) => ({
        claim,
        passportIds: ss.map((s) => s.passportId),
        support: ss.reduce((sum, s) => sum + s.score, 0),
      }))
      .sort((a, b) => b.support - a.support);
    leadingClaim = positions[0].claim;

    // Route to the owner of an official source on the minority side (the one that needs a
    // decision), else the most recently edited official source, else anyone with an owner.
    const disputed = inScope.filter((s) => s.claim && s.owner);
    const official = disputed
      .filter((s) => !isInformal(s.sourceType))
      .sort((a, b) => lastEdited(passports, b) - lastEdited(passports, a));
    const resolveWith =
      official.find((s) => s.claim !== leadingClaim)?.owner ?? official[0]?.owner ?? disputed[0]?.owner ?? null;

    conflicts.push({ topic: q.question, leadingClaim, positions, resolveWith });
    for (const s of inScope) {
      if (!s.claim) continue;
      s.reasons.push(
        s.claim === leadingClaim
          ? `+ Leading position in a conflict (${s.claim})`
          : `− Contradicted by better-supported sources (${leadingClaim})`,
      );
    }
  }

  const rank = (s: ScoredSource) => (!s.inScope ? 0 : leadingClaim && s.claim && s.claim !== leadingClaim ? 1 : 2);
  scored.sort((a, b) => rank(b) - rank(a) || b.score - a.score);

  // 4. Answer, confidence, uncertainty, who to contact.
  const top = scored.find((s) => s.inScope) ?? null;
  const uncertainty: string[] = [];
  if (!top) uncertainty.push(q.country ? `No source found that applies to ${q.country}` : "No relevant source found");
  if (top && top.verificationStatus !== "verified") uncertainty.push(`The best source is not currently verified`);
  if (top && !top.owner) uncertainty.push("The best source has no owner");
  if (conflicts.length)
    uncertainty.push(
      `Sources disagree: ${conflicts[0].positions.map((p) => `${p.claim} (${p.passportIds.length} source(s))`).join(" vs ")}`,
    );
  if (!scored.some((s) => s.inScope && s.verificationStatus === "verified"))
    uncertainty.push("No verified source in scope: this is a knowledge gap");

  let confidence: AskResult["confidence"] = "none";
  if (top) {
    if (top.score >= 75 && !conflicts.length && top.verificationStatus === "verified") confidence = "high";
    else if (top.score >= 50 && !conflicts.length) confidence = "medium";
    else confidence = "low";
  }

  const whoToContact: Owner | null =
    conflicts[0]?.resolveWith ?? top?.owner ?? inScope.find((s) => s.owner)?.owner ?? null;

  return {
    answer: top ? top.excerpt : null,
    confidence,
    topSourceId: top?.passportId ?? null,
    sources: scored,
    conflicts,
    uncertainty,
    whoToContact,
  };
}

function isInformal(t: SourceType): boolean {
  return t === "teams_chat" || t === "email";
}

function lastEdited(passports: Passport[], s: ScoredSource): number {
  const p = passports.find((x) => x.id === s.passportId);
  return p ? new Date(p.lastEditedAt).getTime() : 0;
}
