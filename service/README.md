# Trust Passport backend (Firebase)

Backend for the SD Worx challenge: every source gets a **passport** (owner, verification, scope, fingerprint), and every question gets **ranked, explained sources**, detected **conflicts**, honest **uncertainty** and **who to contact**.

## What's in here

```
firebase.json              emulators, rules, functions config
firestore.rules            deny by default; clients may only READ passports
storage.rules              own folder only, max 10 MB, PDF/DOCX/TXT only
.gitignore                 keeps secrets and keys out of git (Aikido)
functions/
  src/index.ts             Cloud Functions: ingest, ask, verifySource
  src/scoring.ts           trust score + conflict detection (pure, no Firebase)
  src/store.ts             passport + chunk storage, retrieval
  src/schemas.ts           zod validation for every input
  src/text.ts              sha256, chunking, keywords, claim extraction
  src/types.ts             shared types (share with the frontend)
  src/seedData.ts          the 4 FICTIONAL demo sources (Example A)
  src/scripts/demo.ts      run the scoring without Firebase
  src/scripts/seed.ts      load demo data into the emulator
```

## Setup (after `firebase init`)

1. Copy these files over the ones `firebase init` created (keep your `.firebaserc`).
2. Install and try the logic without Firebase:
   ```bash
   cd functions
   npm install
   npm run demo
   ```
   You should see the 92% policy on top, confidence `low`, a 92% vs 85% conflict routed to Tom Peeters, and the Dutch document flagged out of scope.
3. Start the emulators (terminal 1, from the project root):
   ```bash
   cd functions && npm run build && cd ..
   firebase emulators:start
   ```
4. Seed the demo data (terminal 2). Use your real project ID from `.firebaserc`:
   ```bash
   cd functions
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=your-project-id npm run seed
   ```
   The seed script refuses to run if it isn't pointed at the emulator.
5. Open http://localhost:4000 to see `passports` and `chunks` in the Firestore tab.

## Roles

| Who | Can do | How it's enforced |
|---|---|---|
| Any signed-in user | `ask`, read passports | `request.auth` in functions and rules |
| Curator | `ingest` new sources | custom claim `curator: true` |
| Source owner | `verifySource` on *their* source | verified email must equal `owner.contact` |

In the emulator, set a curator in the Auth tab of http://localhost:4000: edit the user and add custom claims `{"curator": true}`.

## API contract (for the frontend)

Call with the Firebase SDK, region `europe-west1`:

```js
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
const functions = getFunctions(app, "europe-west1");
if (location.hostname === "localhost") connectFunctionsEmulator(functions, "127.0.0.1", 5001);

const ask = httpsCallable(functions, "ask");
const { data } = await ask({ question: "How is double holiday pay calculated for a part-time employee?", country: "BE" });
```

### `ask({ question, country?, client? })` returns

```jsonc
{
  "answer": "Double holiday pay equals 92% ...",   // excerpt of the top source
  "confidence": "low",                            // high | medium | low | none
  "topSourceId": "be-holiday-pay-policy-v3",
  "sources": [{
    "passportId": "...", "title": "...", "sourceType": "policy",
    "owner": { "name": "...", "team": "...", "contact": "..." } | null,
    "verificationStatus": "verified | expired | changed_since_verification | unverified",
    "inScope": true, "scopeNote": null,
    "score": 53,
    "breakdown": { "relevance": 30, "verification": 0, "owner": 0, "sourceType": 15, "agreement": 8 },
    "reasons": ["− Never verified", "− No owner", "+ Official policy", "..."],
    "excerpt": "...", "claim": "92%"
  }],
  "conflicts": [{
    "topic": "...", "leadingClaim": "92%",
    "positions": [{ "claim": "92%", "passportIds": ["..."], "support": 94 }, { "claim": "85%", "passportIds": ["..."], "support": 58 }],
    "resolveWith": { "name": "Tom Peeters", "...": "..." }
  }],
  "uncertainty": ["Sources disagree: 92% (2 source(s)) vs 85% (1 source(s))", "..."],
  "whoToContact": { "name": "Tom Peeters", "team": "...", "contact": "..." }
}
```

`sources` is already sorted for display. Show `reasons` and `breakdown` next to each source: that is the "why you can trust it" part.

### `ingest({ title, text, sourceType, owner, lastEditedAt, lastVerifiedAt, reviewIntervalDays?, scope })`
Returns `{ passport }`. Errors: `permission-denied` (not a curator), `invalid-argument` (with `issues`), `already-exists` (same content already stored, with `existingId`).

### `verifySource({ passportId })`
Owner confirms the source. Returns `{ passportId, lastVerifiedAt }`.

## How the score works

Max 100 points: relevance 30, verification 25, owner 15, source type 15, agreement 15.

- **Verification ≠ editing.** A source edited after its last verification only gets 20% of the verification points.
- **Scope first.** A source for another country or client is flagged out of scope and sinks, but stays visible with the reason.
- **Informal sources** (Teams, email) get fewer points, and their "owner" counts as an author (half points).
- **Conflicts.** Sources are grouped by their key figure. When they disagree, the position with the most combined trust leads, both positions are shown, and the conflict is routed to the owner of the official document on the minority side.

Weights live at the top of `scoring.ts`. Tune them with `npm run demo`.

## Security and Aikido checklist

Done in the code:
- [x] Deny-by-default Firestore and Storage rules; clients never write directly
- [x] Auth check + zod validation in every function; generic errors only (details go to server logs)
- [x] Least privilege: curator claim for ingest, owner-only verification, no ID probing
- [x] SHA-256 fingerprint per source (integrity + duplicate detection)
- [x] EU region, `maxInstances` cap against cost abuse
- [x] Seed script can't run against production
- [x] `npm audit`: 0 vulnerabilities (patched `uuid` via `overrides`)

Your to-do:
- [ ] Connect the GitHub repo to Aikido, install the IDE extension and the secrets pre-commit hook
- [ ] Commit `.gitignore` **before** anything else
- [ ] Any API key (LLM, embeddings) only via `firebase functions:secrets:set NAME`
- [ ] Run a full Aikido scan before submitting; fix or justify every high/critical finding
- [ ] The Firebase web `apiKey` in the frontend is public by design: mark it as ignored in Aikido with that justification
- [ ] Optional for production: enable App Check (`enforceAppCheck: true` on the functions)

## Next steps

- **Better retrieval:** replace keyword search with embeddings (Firestore vector search / `findNearest`) in `store.ts`. The scoring stays the same.
- **LLM-written answers:** if you generate the answer with an LLM, put each excerpt inside clear delimiters and tell the model to treat it as data, never as instructions (prompt injection). Keep the trust score computed in code, not by the LLM, so it stays explainable.
