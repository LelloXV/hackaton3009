// Cloud Functions entry point: ingest, ask, verifySource.
// Security model:
//  - Clients never write to Firestore directly (see firestore.rules); these functions do, via the Admin SDK.
//  - Every function checks authentication, validates input with zod and returns generic errors only.
//  - ingest needs the "curator" custom claim; verifySource can only be called by the source's owner.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions, logger } from "firebase-functions/v2";
import { CallableRequest, HttpsError, onCall } from "firebase-functions/v2/https";
import { ZodError } from "zod";
import { askSchema, ingestSchema, verifySchema } from "./schemas";
import { rankSources } from "./scoring";
import { DuplicateError, PASSPORTS, retrieve, storeSource } from "./store";
import { Passport } from "./types";

initializeApp();
const db = getFirestore();

// EU region (GDPR) and a cap on instances so a flood of requests can't run up the bill.
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

function requireAuth(req: CallableRequest): { uid: string; email?: string; emailVerified: boolean; curator: boolean } {
  if (!req.auth) throw new HttpsError("unauthenticated", "Please sign in.");
  const t = req.auth.token;
  return {
    uid: req.auth.uid,
    email: t.email,
    emailVerified: t.email_verified === true,
    curator: t.curator === true,
  };
}

/** Wrap a handler so validation errors are clean and nothing internal leaks to the client. */
function safe<T>(name: string, handler: (req: CallableRequest) => Promise<T>) {
  return onCall({ timeoutSeconds: 30, memory: "256MiB" }, async (req) => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      if (err instanceof ZodError) {
        throw new HttpsError("invalid-argument", "Invalid input.", {
          issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        });
      }
      logger.error(`${name} failed`, err); // full detail stays in the server logs only
      throw new HttpsError("internal", "Something went wrong. Please try again.");
    }
  });
}

/** Add a source: builds its passport and chunks. Curators only. */
export const ingest = safe("ingest", async (req) => {
  const user = requireAuth(req);
  if (!user.curator) throw new HttpsError("permission-denied", "Only curators can add sources.");
  const input = ingestSchema.parse(req.data);
  try {
    const passport = await storeSource(db, input, user.uid);
    return { passport };
  } catch (err) {
    if (err instanceof DuplicateError) {
      throw new HttpsError("already-exists", "This content already exists.", { existingId: err.existingId });
    }
    throw err;
  }
});

/** Ask a question: returns the ranked sources, the trust reasons, conflicts and who to contact. */
export const ask = safe("ask", async (req) => {
  requireAuth(req);
  const input = askSchema.parse(req.data);
  const { passports, chunks } = await retrieve(db, input.question);
  return rankSources(passports, chunks, input);
});

/** The owner confirms a source is correct: sets lastVerifiedAt. Closes the loop after a conflict. */
export const verifySource = safe("verifySource", async (req) => {
  const user = requireAuth(req);
  const { passportId } = verifySchema.parse(req.data);
  const ref = db.collection(PASSPORTS).doc(passportId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    // Same message whether it doesn't exist or isn't yours, so nobody can probe for IDs.
    const passport = snap.data() as Passport | undefined;
    const isOwner =
      passport?.owner && user.emailVerified && user.email?.toLowerCase() === passport.owner.contact.toLowerCase();
    if (!passport || !isOwner) throw new HttpsError("permission-denied", "You can't verify this source.");

    const now = new Date().toISOString();
    tx.update(ref, { lastVerifiedAt: now });
    return { passportId, lastVerifiedAt: now };
  });
});
