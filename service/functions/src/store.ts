// Firestore access: building and storing passports and chunks (Admin SDK only).
import { Firestore } from "firebase-admin/firestore";
import { IngestInput } from "./schemas";
import { chunkText, sha256, terms } from "./text";
import { Chunk, Passport } from "./types";

export const PASSPORTS = "passports";
export const CHUNKS = "chunks";

export class DuplicateError extends Error {
  constructor(public existingId: string) {
    super("duplicate");
  }
}

/** Build the passport + chunks for a source and write them atomically. */
export async function storeSource(db: Firestore, input: IngestInput, ingestedBy: string, id?: string): Promise<Passport> {
  const hash = sha256(input.text);

  // Detect duplicates: identical content already ingested under another passport.
  const dup = await db.collection(PASSPORTS).where("sha256", "==", hash).limit(1).get();
  if (!dup.empty && dup.docs[0].id !== id) throw new DuplicateError(dup.docs[0].id);

  const ref = id ? db.collection(PASSPORTS).doc(id) : db.collection(PASSPORTS).doc();
  const passport: Passport = {
    id: ref.id,
    title: input.title,
    sourceType: input.sourceType,
    owner: input.owner,
    lastEditedAt: input.lastEditedAt,
    lastVerifiedAt: input.lastVerifiedAt,
    reviewIntervalDays: input.reviewIntervalDays,
    scope: input.scope,
    sha256: hash,
    ingestedAt: new Date().toISOString(),
    ingestedBy,
  };

  const batch = db.batch();
  // Replace old chunks if the source is re-ingested.
  const old = await db.collection(CHUNKS).where("passportId", "==", ref.id).get();
  old.docs.forEach((d) => batch.delete(d.ref));
  batch.set(ref, passport);
  chunkText(input.text).forEach((text, position) => {
    const chunk: Chunk = { passportId: ref.id, position, text, terms: terms(text) };
    batch.set(db.collection(CHUNKS).doc(), chunk);
  });
  await batch.commit();
  return passport;
}

/** Keyword retrieval. Firestore allows at most 30 values in array-contains-any. */
export async function retrieve(db: Firestore, question: string): Promise<{ passports: Passport[]; chunks: Chunk[] }> {
  const qTerms = terms(question).slice(0, 30);
  if (qTerms.length === 0) return { passports: [], chunks: [] };

  const snap = await db.collection(CHUNKS).where("terms", "array-contains-any", qTerms).limit(100).get();
  const chunks = snap.docs.map((d) => d.data() as Chunk);
  const ids = [...new Set(chunks.map((c) => c.passportId))];
  if (ids.length === 0) return { passports: [], chunks: [] };

  const refs = ids.map((id) => db.collection(PASSPORTS).doc(id));
  const docs = await db.getAll(...refs);
  const passports = docs.filter((d) => d.exists).map((d) => d.data() as Passport);
  return { passports, chunks };
}
