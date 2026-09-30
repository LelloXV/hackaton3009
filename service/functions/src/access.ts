// Who may change a passport, and what confirming it does. Pure functions (no Firebase).
import { Passport, Team } from "./types";

export function memberFor(teams: Team[], email: string): { id: string; name: string } | null {
  const address = email.toLowerCase();
  for (const t of teams) {
    const m = t.members.find((x) => x.email.toLowerCase() === address);
    if (m) return m;
  }
  return null;
}

/**
 * Anyone in the owning team may update and confirm the passport, so the work continues
 * when someone changes role or leaves. A person owner can only act on their own passport.
 */
export function canEdit(passport: Passport, teams: Team[], email: string | undefined): boolean {
  if (!passport.owner || !email) return false;
  const team = teams.find((t) => t.id === passport.owner!.id);
  if (team) return team.members.some((m) => m.email.toLowerCase() === email.toLowerCase());
  return memberFor(teams, email)?.id === passport.owner.id;
}

/**
 * Contract rule for "Confirm still valid": append a "verified" stamp for the current version,
 * naming the person, and set lastVerifiedAt to its time. Open conflicts stay open.
 */
export function confirmPassport(passport: Passport, person: { id: string; name: string }, at: Date): Passport {
  const iso = at.toISOString().replace(/\.\d+Z$/, "Z");
  return {
    ...passport,
    lastVerifiedAt: iso,
    stamps: [
      ...passport.stamps,
      {
        id: `stamp.${passport.id}.verified.${at.getTime()}`,
        type: "verified",
        at: iso,
        actor: { id: person.id, name: person.name, type: "person" },
        version: passport.version,
        note: "Confirmed still valid by a member of the owning team.",
        relatedStampIds: [],
      },
    ],
  };
}
