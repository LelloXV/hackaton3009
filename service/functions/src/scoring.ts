// Trust scoring and question answering over passports.
// Pure functions (no Firebase) so they are easy to test and to explain to the judges.
import {
  AskResult,
  AskResultItem,
  Chunk,
  Conflict,
  Contact,
  Criterion,
  CriterionStatus,
  Evidence,
  Level,
  Passport,
  Team,
  Trust,
} from "./types";
import { daysBetween, extractClaims, formatDate, sentences, terms } from "./text";
import { canEdit } from "./access";

// Maximum points per criterion (total 100). Tune these, but keep them visible.
export const WEIGHTS = {
  sources_agree: 20,
  last_updated: 20,
  owner_unit: 15,
  scope_coverage: 15,
  owner_review: 10,
  department_defined: 10,
  open_issues: 10,
} as const;

const LABELS: Record<Criterion["id"], string> = {
  sources_agree: "Sources agree",
  last_updated: "Last updated",
  owner_unit: "Owner (unit)",
  scope_coverage: "Scope coverage",
  owner_review: "Owner review",
  department_defined: "Department defined",
  open_issues: "Open issues",
};

const FRESH_DAYS = 90; // "≤ 3 months"
const AGING_DAYS = 180; // "3-6 months"

export function levelFor(score: number): Level {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

/** A passport is archived once it is no longer relevant (expiresAt has passed). */
export function isArchived(p: Passport, now: Date): boolean {
  return p.expiresAt !== null && now.getTime() >= new Date(p.expiresAt).getTime();
}

function criterion(id: Criterion["id"], points: number, status: CriterionStatus, details: string): Criterion {
  return { id, label: LABELS[id], maxPoints: WEIGHTS[id], points: Math.round(points), status, details };
}

/** Topic of a stamp note: the part before ":" ("Conflicting go-live date: ..."). */
function noteTopic(note: string): string {
  const i = note.indexOf(":");
  return i > 0 && i < 80 ? note.slice(0, i) : note;
}

export function evaluateTrust(p: Passport, now: Date): Trust {
  const current = p.stamps.filter((s) => s.version === p.version);
  const resolved = new Set(current.filter((s) => s.type === "conflict_resolved").flatMap((s) => s.relatedStampIds));
  const openConflicts = current.filter((s) => s.type === "conflict" && !resolved.has(s.id));

  const criteria: Criterion[] = [];

  // Sources agree: an unresolved conflict on the current version costs all points.
  criteria.push(
    openConflicts.length > 0
      ? criterion("sources_agree", 0, "conflict", noteTopic(openConflicts[0].note))
      : criterion("sources_agree", WEIGHTS.sources_agree, "ok", "No conflicts between sources"),
  );

  // Last updated: content changed recently?
  const updatedDays = daysBetween(p.updatedAt, now);
  const updated = formatDate(p.updatedAt);
  criteria.push(
    updatedDays <= FRESH_DAYS
      ? criterion("last_updated", WEIGHTS.last_updated, "ok", `${updated} (≤ 3 months)`)
      : updatedDays <= AGING_DAYS
        ? criterion("last_updated", WEIGHTS.last_updated / 2, "partial", `${updated} (3-6 months)`)
        : criterion("last_updated", 0, "stale", `${updated} (> 6 months)`),
  );

  // Owner (unit): a team keeps the knowledge alive when people leave.
  criteria.push(
    !p.owner
      ? criterion("owner_unit", 0, "missing", "No owner")
      : p.owner.type === "team"
        ? criterion("owner_unit", WEIGHTS.owner_unit, "ok", p.owner.name)
        : criterion("owner_unit", WEIGHTS.owner_unit / 2, "partial", `${p.owner.name} (a person, not a team)`),
  );

  // Scope coverage: do the sources cover every country the passport claims?
  criteria.push(scopeCoverage(p));

  // Owner review: a person of the owning team checked the current version recently.
  const verified = p.stamps
    .filter((s) => s.type === "verified" && s.actor.type === "person")
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const latest = verified[0];
  if (!latest) {
    criteria.push(criterion("owner_review", 0, "missing", "Never reviewed"));
  } else {
    const days = daysBetween(latest.at, now);
    const currentVersion = latest.version === p.version;
    if (currentVersion && days <= FRESH_DAYS) {
      criteria.push(criterion("owner_review", WEIGHTS.owner_review, "ok", days === 0 ? "Reviewed today" : `Reviewed ${days} days ago`));
    } else if (days <= AGING_DAYS) {
      criteria.push(
        criterion(
          "owner_review",
          WEIGHTS.owner_review / 2,
          "stale",
          days <= FRESH_DAYS ? "Current version not reviewed yet" : "Last review > 3 months ago",
        ),
      );
    } else {
      criteria.push(criterion("owner_review", 0, "stale", "Last review > 6 months ago"));
    }
  }

  // Department defined.
  criteria.push(
    p.departments.length > 0
      ? criterion("department_defined", WEIGHTS.department_defined, "ok", p.departments[0])
      : criterion("department_defined", 0, "missing", "No department"),
  );

  // Open issues: a major gap costs all points, minor ones half.
  const major = p.openIssues.filter((i) => i.severity === "major");
  const more = (n: number) => (n > 1 ? ` (+${n - 1} more)` : "");
  criteria.push(
    p.openIssues.length === 0
      ? criterion("open_issues", WEIGHTS.open_issues, "ok", "No open issues")
      : major.length > 0
        ? criterion("open_issues", 0, "missing", `${major[0].title}${more(major.length)}`)
        : criterion("open_issues", WEIGHTS.open_issues / 2, "partial", `${p.openIssues.length} open: ${p.openIssues[0].title}`),
  );

  const score = criteria.reduce((sum, c) => sum + c.points, 0);
  return { score, level: levelFor(score), criteria };
}

function scopeCoverage(p: Passport): Criterion {
  const countries = p.visa.countries;
  if (countries.mode === "unknown") return criterion("scope_coverage", 0, "missing", "Countries not defined");
  if (countries.mode === "all") return criterion("scope_coverage", WEIGHTS.scope_coverage, "ok", "Applies to all countries");
  const stated = p.linkedSources.flatMap((s) => s.countries);
  if (stated.length === 0) return criterion("scope_coverage", WEIGHTS.scope_coverage / 2, "partial", "Source coverage unknown");
  const covered = countries.values.filter((c) => stated.includes(c)).length;
  const total = countries.values.length;
  const details = total === 1 ? (covered ? `Covers ${countries.values[0]}` : `No source covers ${countries.values[0]}`) : `Covers ${covered}/${total} countries`;
  return criterion("scope_coverage", (WEIGHTS.scope_coverage * covered) / total, covered === total ? "ok" : "partial", details);
}

// ---------- Questions ----------

export interface Query {
  question: string;
  country?: string;
  client?: string;
  viewerEmail?: string; // who asks: decides canEdit on each result
}

/** Contract rule: listed -> only listed values match; all -> matches; unknown -> not a mismatch. */
function scopeCheck(p: Passport, q: Query): { inScope: boolean; note: string | null } {
  const { countries, clients } = p.visa;
  if (q.country && countries.mode === "listed" && !countries.values.includes(q.country)) {
    return { inScope: false, note: `Applies to ${countries.values.join(", ")}, not ${q.country}` };
  }
  if (q.client && clients.mode === "listed" && !clients.values.includes(q.client)) {
    return { inScope: false, note: "Written for other clients" };
  }
  return { inScope: true, note: null };
}

export function contactFor(p: Passport, teams: Team[]): Contact | null {
  if (!p.owner) return null;
  const team = teams.find((t) => t.id === p.owner!.id);
  if (!team) return { id: p.owner.id, name: p.owner.name, unit: p.owner.type === "team" ? p.owner.name : "", contact: "", expertise: [] };
  return { id: team.lead.id, name: team.lead.name, unit: team.name, contact: team.lead.email, expertise: team.expertise };
}

// Superseded or derived material is not evidence for the current answer.
const EVIDENCE_RELATIONS = new Set(["supports", "contradicts"]);
const INFORMAL = new Set(["chat", "email"]);
// Questions that ask for a date or an amount: prefer sentences that contain one.
const ASKS_FOR_FIGURE = /\b(when|date|deadline|how much|percent|percentage|rate)\b|%/i;

export function answerQuestion(
  passports: Passport[],
  chunks: Chunk[],
  teams: Team[],
  q: Query,
  now = new Date(),
): AskResult {
  const qTerms = terms(q.question);
  const hits = (text: string, list: string[]) => {
    const t = terms(text);
    return list.filter((w) => t.includes(w)).length;
  };

  // 1. Relevance per passport (best chunk).
  const relevant = chunks.filter((c) => qTerms.some((t) => c.terms.includes(t)));
  const relevance = new Map<string, number>();
  for (const c of relevant) {
    const r = qTerms.filter((t) => c.terms.includes(t)).length / qTerms.length;
    relevance.set(c.passportId, Math.max(relevance.get(c.passportId) ?? 0, r));
  }

  // 2. One item per matching passport.
  const items: AskResultItem[] = [];
  for (const p of passports) {
    const r = relevance.get(p.id);
    if (!r) continue;
    const scope = scopeCheck(p, q);
    items.push({
      ref: 0,
      passportId: p.id,
      passport: p,
      trust: evaluateTrust(p, now),
      archived: isArchived(p, now),
      canEdit: canEdit(p, teams, q.viewerEmail),
      excerpt: bestSentence(p, chunks, qTerms, ASKS_FOR_FIGURE.test(q.question), hits) ?? p.description,
      inScope: scope.inScope,
      scopeNote: scope.note,
    });
  }

  // Relevance first, then trust. Out-of-scope passports go last; archived ones are listed apart.
  const rank = (i: AskResultItem) => (relevance.get(i.passportId) ?? 0) * 100 * 0.6 + i.trust.score * 0.4;
  const byRank = (a: AskResultItem, b: AskResultItem) => Number(b.inScope) - Number(a.inScope) || rank(b) - rank(a);
  const results = items.filter((i) => !i.archived).sort(byRank);
  const archived = items.filter((i) => i.archived).sort(byRank);
  [...results, ...archived].forEach((item, index) => (item.ref = index + 1));

  // 3. Conflicts among active, in-scope passports.
  const usable = results.filter((i) => i.inScope);
  const conflict = detectConflict(usable, chunks, teams, qTerms, q.question);
  const conflicts = conflict ? [conflict] : [];

  // 4. Answer, confidence, uncertainty, who to contact.
  const top = usable[0] ?? null;
  const refOf = (passportId: string) => results.find((i) => i.passportId === passportId)?.ref;
  let answer: string | null = null;
  if (conflict) {
    const parts = conflict.positions.map((pos) => {
      const refs = [...new Set(pos.evidence.flatMap((e) => e.passportIds).map(refOf))].sort().map((r) => `[${r}]`).join(" ");
      return `${pos.claim} according to ${refs}`;
    });
    const who = conflict.resolveWith;
    answer =
      `Sources disagree. ${parts.join("; ")}. ${conflict.leadingClaim} has the most support` +
      (who ? `, but check with ${who.name} (${who.unit}) before answering.` : ", but check with the owner before answering.");
  } else if (top) {
    answer = `${top.excerpt} [${top.ref}]`;
  }

  const uncertainty: string[] = [];
  if (!top) uncertainty.push(q.country ? `No active passport found that applies to ${q.country}` : "No relevant passport found");
  if (conflict) {
    uncertainty.push(
      `Sources disagree: ${conflict.positions.map((p) => `${p.claim} (${p.evidence.length} source${p.evidence.length > 1 ? "s" : ""})`).join(" vs ")}.`,
    );
  }
  if (top) {
    for (const c of top.trust.criteria) {
      if (c.status !== "ok" && c.id !== "sources_agree") uncertainty.push(`${c.label}: ${c.details}.`);
    }
  }
  if (archived.length > 0) {
    uncertainty.push(
      `${archived.length} archived passport${archived.length > 1 ? "s" : ""} also matched and ${archived.length > 1 ? "were" : "was"} left out: ${archived.map((a) => a.passport.title).join(", ")}.`,
    );
  }

  let confidence: AskResult["confidence"] = "none";
  if (top) {
    if (conflict) confidence = "low";
    else if (top.trust.level === "high") confidence = "high";
    else if (top.trust.level === "medium") confidence = "medium";
    else confidence = "low";
  }

  return {
    question: q.question,
    context: { country: q.country ?? null, client: q.client ?? null },
    answer,
    confidence,
    results,
    archived,
    conflicts,
    uncertainty,
    whoToContact: conflict?.resolveWith ?? (top ? contactFor(top.passport, teams) : null),
  };
}

// The sentence that best answers the question: most question words, from an official
// source, and containing a key figure (date or percentage) when the question asks for one.
function bestSentence(
  p: Passport,
  chunks: Chunk[],
  qTerms: string[],
  wantsFigure: boolean,
  hits: (text: string, list: string[]) => number,
): string | null {
  let best: { text: string; score: number } | null = null;
  for (const c of chunks.filter((x) => x.passportId === p.id)) {
    const source = p.linkedSources.find((s) => s.id === c.linkedSourceId);
    if (!source || !EVIDENCE_RELATIONS.has(source.relation)) continue;
    for (const s of sentences(c.text)) {
      const h = hits(s, qTerms);
      if (h === 0) continue;
      // Very short sentences are usually titles ("Country readiness checklist."), not answers.
      const isTitle = s.split(/\s+/).length < 6 && extractClaims(s).length === 0;
      const score = h + (INFORMAL.has(source.sourceType) ? 0 : 1) + (wantsFigure && extractClaims(s).length > 0 ? 2 : 0) - (isTitle ? 1.5 : 0);
      if (!best || score > best.score) best = { text: s, score };
    }
  }
  return best?.text ?? null;
}

function detectConflict(
  usable: AskResultItem[],
  chunks: Chunk[],
  teams: Team[],
  qTerms: string[],
  question: string,
): Conflict | null {
  // Collect key figures from sentences that mention the question's words. One evidence item
  // per source, remembering every passport that links it (a source can be shared).
  const byClaim = new Map<string, Map<string, Evidence>>();
  for (const item of usable) {
    for (const c of chunks.filter((x) => x.passportId === item.passportId)) {
      const source = item.passport.linkedSources.find((s) => s.id === c.linkedSourceId);
      if (!source || !EVIDENCE_RELATIONS.has(source.relation)) continue;
      for (const s of sentences(c.text)) {
        if (!qTerms.some((t) => terms(s).includes(t))) continue;
        for (const claim of extractClaims(s)) {
          const sources = byClaim.get(claim) ?? new Map<string, Evidence>();
          const existing = sources.get(source.id);
          if (existing) {
            if (!existing.passportIds.includes(item.passportId)) existing.passportIds.push(item.passportId);
          } else {
            sources.set(source.id, {
              passportId: item.passportId,
              passportIds: [item.passportId],
              linkedSourceId: source.id,
              title: source.title,
              app: source.app,
              date: source.updatedAt,
              excerpt: s,
            });
          }
          byClaim.set(claim, sources);
        }
      }
    }
  }

  // Only compare figures of the same kind (dates with dates, percentages with percentages).
  const kinds = new Map<string, string[]>();
  for (const claim of byClaim.keys()) {
    const kind = claim.endsWith("%") ? "percent" : "date";
    kinds.set(kind, [...(kinds.get(kind) ?? []), claim]);
  }
  const disputed = [...kinds.values()].find((claims) => claims.length > 1);
  if (!disputed) return null;

  // The position with the most combined trust leads; both are shown.
  const scoreOf = (id: string) => usable.find((i) => i.passportId === id)?.trust.score ?? 0;
  const positions = disputed
    .map((claim) => {
      const evidence = [...byClaim.get(claim)!.values()];
      const support = [...new Set(evidence.flatMap((e) => e.passportIds))].reduce((sum, id) => sum + scoreOf(id), 0);
      return { claim, support, evidence };
    })
    .sort((a, b) => b.support - a.support);

  // Route to the owner of the passport involved in most positions (its sources disagree internally).
  const involvement = new Map<string, number>();
  for (const pos of positions) {
    for (const id of new Set(pos.evidence.flatMap((e) => e.passportIds))) involvement.set(id, (involvement.get(id) ?? 0) + 1);
  }
  const [routeId] = [...involvement.entries()].sort((a, b) => b[1] - a[1] || scoreOf(b[0]) - scoreOf(a[0]))[0];
  const routeItem = usable.find((i) => i.passportId === routeId)!;
  const contact = contactFor(routeItem.passport, teams);
  const inAll = involvement.get(routeId) === positions.length;

  const newest = positions
    .flatMap((p) => p.evidence.map((e) => ({ ...e, claim: p.claim })))
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())[0];
  const titles = (e: Evidence[]) => [...new Set(e.map((x) => x.title))].join(" and ");
  const difference =
    positions.map((p) => `${titles(p.evidence)} say${p.evidence.length > 1 ? "" : "s"} ${p.claim}`).join("; ") +
    "." +
    (newest ? ` The most recent source is the ${newest.title} (${formatDate(newest.date!)}), which says ${newest.claim}.` : "");

  return {
    id: `conflict.${positions.map((p) => p.claim.replace(/\W+/g, "-")).join(".")}`,
    topic: question,
    leadingClaim: positions[0].claim,
    positions,
    difference,
    resolveWith: contact && {
      ...contact,
      reason: `Leads ${contact.unit || "the owning team"}, owner of "${routeItem.passport.title}"${inAll ? ", whose own sources give both answers" : ""}.`,
    },
  };
}
