// Cloud Functions entry point: whoAmI, ask, getPassport, confirmStillValid, askPassportAI, ingest.
// Security model:
//  - Clients never write to Firestore directly (see firestore.rules); these functions do, via the Admin SDK.
//  - Every function checks authentication, validates input with zod and returns generic errors only.
//  - ingest needs the "curator" custom claim; confirmStillValid needs membership of the owning team.
//  - The Anthropic API key is a Firebase secret, never sent to or stored in the frontend.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { setGlobalOptions, logger } from "firebase-functions/v2";
import { CallableRequest, HttpsError, onCall } from "firebase-functions/v2/https";
import { ZodError } from "zod";
import { askPassportAI as answerWithAI } from "./ai";
import { askAiSchema, askSchema, ingestSchema, passportIdSchema } from "./schemas";
import { answerQuestion, evaluateTrust, isArchived } from "./scoring";
import { canEdit, confirmPassport, memberFor } from "./access";
import { PASSPORTS, chunksFor, getPassport as loadPassport, getTeams, retrieve, storePassport } from "./store";
import { Me, Passport, PassportView, Team } from "./types";

initializeApp();
const db = getFirestore();
const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

// EU region (GDPR) and a cap on instances so a flood of requests can't run up the bill.
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

function requireAuth(req: CallableRequest): { uid: string; email?: string; emailVerified: boolean; curator: boolean } {
  if (!req.auth) throw new HttpsError("unauthenticated", "Please sign in.");
  const t = req.auth.token;
  return { uid: req.auth.uid, email: t.email, emailVerified: t.email_verified === true, curator: t.curator === true };
}

/** Wrap a handler so validation errors are clean and nothing internal leaks to the client. */
function safe<T>(name: string, handler: (req: CallableRequest) => Promise<T>, secrets: ReturnType<typeof defineSecret>[] = []) {
  return onCall({ timeoutSeconds: 60, memory: "256MiB", secrets }, async (req) => {
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

function view(passport: Passport, teams: Team[], email: string | undefined, now = new Date()): PassportView {
  return {
    passport,
    trust: evaluateTrust(passport, now),
    archived: isArchived(passport, now),
    canEdit: canEdit(passport, teams, email),
  };
}

/** The signed-in user and their teams (the frontend shows it in the header). */
export const whoAmI = safe("whoAmI", async (req): Promise<Me> => {
  const user = requireAuth(req);
  const teams = await getTeams(db);
  const email = user.email ?? "";
  const mine = teams.filter((t) => t.members.some((m) => m.email.toLowerCase() === email.toLowerCase()));
  const member = memberFor(teams, email);
  return {
    uid: user.uid,
    name: member?.name ?? (req.auth!.token.name as string | undefined) ?? email,
    email,
    emailVerified: user.emailVerified,
    teams: mine.map((t) => ({ id: t.id, name: t.name })),
  };
});

/** Ask a question: ranked passports with their trust, conflicts, uncertainty and who to contact. */
export const ask = safe("ask", async (req) => {
  const user = requireAuth(req);
  const input = askSchema.parse(req.data);
  const [{ passports, chunks }, teams] = await Promise.all([retrieve(db, input.question), getTeams(db)]);
  return answerQuestion(passports, chunks, teams, { ...input, viewerEmail: user.email });
});

/** One passport with its computed trust score. Same message for missing and unknown IDs. */
export const getPassport = safe("getPassport", async (req) => {
  const user = requireAuth(req);
  const { passportId } = passportIdSchema.parse(req.data);
  const [passport, teams] = await Promise.all([loadPassport(db, passportId), getTeams(db)]);
  if (!passport) throw new HttpsError("not-found", "Passport not found.");
  return view(passport, teams, user.email);
});

/**
 * A member of the owning team confirms the current version is still valid.
 * Contract: append a "verified" stamp naming the person and set lastVerifiedAt. Conflicts stay open.
 */
export const confirmStillValid = safe("confirmStillValid", async (req) => {
  const user = requireAuth(req);
  const { passportId } = passportIdSchema.parse(req.data);
  const teams = await getTeams(db);
  const ref = db.collection(PASSPORTS).doc(passportId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const passport = snap.data() as Passport | undefined;
    // Same message whether it doesn't exist or isn't yours, so nobody can probe for IDs.
    if (!passport || !user.emailVerified || !canEdit(passport, teams, user.email)) {
      throw new HttpsError("permission-denied", "You can't confirm this passport.");
    }
    if (isArchived(passport, new Date())) {
      throw new HttpsError("failed-precondition", "Archived passports can't be confirmed.");
    }
    const updated = confirmPassport(passport, memberFor(teams, user.email!)!, new Date());
    tx.set(ref, updated);
    return view(updated, teams, user.email);
  });
});

/** Chat about one passport, answered only from its sources. */
export const askPassportAI = safe(
  "askPassportAI",
  async (req) => {
    requireAuth(req);
    const { passportId, message } = askAiSchema.parse(req.data);
    const passport = await loadPassport(db, passportId);
    if (!passport) throw new HttpsError("not-found", "Passport not found.");
    const chunks = await chunksFor(db, [passportId]);
    return answerWithAI(passport, chunks, message, anthropicApiKey.value() || null);
  },
  [anthropicApiKey],
);

/** Add or replace a passport and the text of its sources. Curators only. */
export const ingest = safe("ingest", async (req) => {
  const user = requireAuth(req);
  if (!user.curator) throw new HttpsError("permission-denied", "Only curators can add passports.");
  const { passport, sourceTexts } = ingestSchema.parse(req.data);
  await storePassport(db, passport as Passport, sourceTexts);
  return view(passport as Passport, await getTeams(db), user.email);
});
