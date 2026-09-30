// Firestore access: passports, source chunks and the team directory (Admin SDK only).
import { Firestore } from "firebase-admin/firestore";
import { chunkText, terms } from "./text";
import { Chunk, Passport, Team } from "./types";

export const PASSPORTS = "passports";
export const CHUNKS = "chunks";
export const TEAMS = "teams";

export function buildChunks(passport: Passport, sourceTexts: Record<string, string>): Chunk[] {
  return passport.linkedSources.flatMap((s) =>
    chunkText(sourceTexts[s.id] ?? "").map((text, position) => ({
      passportId: passport.id,
      linkedSourceId: s.id,
      position,
      text,
      terms: terms(text),
    })),
  );
}

/** Write a passport and replace its chunks atomically. */
export async function storePassport(db: Firestore, passport: Passport, sourceTexts: Record<string, string>): Promise<void> {
  const unknown = Object.keys(sourceTexts).filter((id) => !passport.linkedSources.some((s) => s.id === id));
  if (unknown.length > 0) throw new Error(`Texts for unknown linked sources: ${unknown.join(", ")}`);

  const batch = db.batch();
  const old = await db.collection(CHUNKS).where("passportId", "==", passport.id).get();
  old.docs.forEach((d) => batch.delete(d.ref));
  batch.set(db.collection(PASSPORTS).doc(passport.id), passport);
  for (const chunk of buildChunks(passport, sourceTexts)) batch.set(db.collection(CHUNKS).doc(), chunk);
  await batch.commit();
}

export async function storeTeam(db: Firestore, team: Team): Promise<void> {
  await db.collection(TEAMS).doc(team.id).set(team);
}

/** Keyword retrieval. Firestore allows at most 30 values in array-contains-any. */
export async function retrieve(db: Firestore, question: string): Promise<{ passports: Passport[]; chunks: Chunk[] }> {
  const qTerms = terms(question).slice(0, 30);
  if (qTerms.length === 0) return { passports: [], chunks: [] };

  const snap = await db.collection(CHUNKS).where("terms", "array-contains-any", qTerms).limit(200).get();
  const ids = [...new Set(snap.docs.map((d) => (d.data() as Chunk).passportId))];
  if (ids.length === 0) return { passports: [], chunks: [] };

  const docs = await db.getAll(...ids.map((id) => db.collection(PASSPORTS).doc(id)));
  const passports = docs.filter((d) => d.exists).map((d) => d.data() as Passport);
  // All chunks of the matching passports: conflicts and excerpts look at whole sources.
  const chunks = await chunksFor(db, ids);
  return { passports, chunks };
}

export async function chunksFor(db: Firestore, passportIds: string[]): Promise<Chunk[]> {
  const result: Chunk[] = [];
  for (let i = 0; i < passportIds.length; i += 30) {
    const snap = await db.collection(CHUNKS).where("passportId", "in", passportIds.slice(i, i + 30)).get();
    result.push(...snap.docs.map((d) => d.data() as Chunk));
  }
  return result;
}

export async function getPassport(db: Firestore, id: string): Promise<Passport | null> {
  const snap = await db.collection(PASSPORTS).doc(id).get();
  return snap.exists ? (snap.data() as Passport) : null;
}

export async function getTeams(db: Firestore): Promise<Team[]> {
  const snap = await db.collection(TEAMS).get();
  return snap.docs.map((d) => d.data() as Team);
}
