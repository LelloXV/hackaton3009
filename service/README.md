# Knowledge Passport backend (Firebase)

Backend for the SD Worx challenge. Every project gets a **passport** (contract:
`docs/passport-contract.md`, v1.1.0): owner team, sources, scope, version history.
Every question gets **ranked passports with a 7-criteria trust score**, detected
**conflicts**, honest **uncertainty** and **who to contact**. Each passport has an
**"Ask AI"** chat that answers only from its own sources.

## What's in here

```
firebase.json              emulators, rules, functions config
firestore.rules            deny by default; clients may only READ passports
storage.rules              own folder only, max 10 MB, PDF/DOCX/TXT only
functions/
  src/index.ts             Cloud Functions: ask, getPassport, confirmStillValid, askPassportAI, ingest
  src/scoring.ts           trust score (7 criteria), archive rule, answers + conflict detection (pure)
  src/access.ts            team ownership: who may confirm, what confirming does (pure)
  src/ai.ts                "Ask AI" with Claude (claude-opus-5-5), extractive fallback without a key
  src/store.ts             Firestore: passports, source chunks, team directory
  src/schemas.ts           zod validation for every input (mirrors schemas/passport.schema.json)
  src/text.ts              chunking, keywords, key-figure (date/percentage) extraction
  src/types.ts             shared types (same shapes the frontend uses)
  src/seedData.ts          the 3 FICTIONAL demo passports, their source texts and 3 teams
  src/scripts/demo.ts      run the scoring without Firebase
  src/scripts/seed.ts      load demo data into the emulator
  src/scripts/exportMocks.ts  write the frontend's mock data from this code
```

## Try it without Firebase

```bash
cd functions
npm install
npm run demo          # Belgium
npm run demo -- NL    # Netherlands
```

You should see: Belgium readiness (95, high) and Global Payroll Harmonisation (63,
medium) ranked; the 2024 pilot listed as **archived**; a conflict "1 April 2027
(support 158) vs 1 January 2027 (63)" routed to Jane De Smet (Transformation Office).

## Keep the frontend in sync

```bash
cd functions
npm run export-mocks
```

This writes `frontend/src/data/generated/*.json` from the real scoring code, so the
frontend's mock mode shows exactly what this backend returns. Run it after changing
`seedData.ts`, `scoring.ts` or the types.

## Run locally with the emulators

Needs Node 22, Java 11+ and the Firebase CLI (`npm install -g firebase-tools`).

```bash
cd functions && npm run build && cd ..
firebase emulators:start                     # terminal 1
cd functions                                 # terminal 2
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=hackaton3009 npm run seed
```

Open http://localhost:4000 to see `passports`, `chunks` and `teams`.
The seed script refuses to run if it isn't pointed at the emulator.

### AI key (optional)

Without a key, "Ask AI" quotes the best matching sentences from the sources.
To use Claude, store the key as a Firebase secret (never in code or in the frontend):

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

For the emulator, put `ANTHROPIC_API_KEY=...` in `functions/.secret.local` (git-ignored).
The model only sees the passport's own sources, wrapped as data, and must cite them.

## Roles

| Who | Can do | How it's enforced |
|---|---|---|
| Any signed-in user | `ask`, `getPassport`, `askPassportAI` | `request.auth` in functions |
| Member of the owning team | `confirmStillValid` | verified email is in `teams/{ownerId}.members` |
| Curator | `ingest` passports and source texts | custom claim `curator: true` |

Ownership is by **team**: when someone leaves, the rest of the team can still
update and confirm the passport. Archived passports (past `expiresAt`) can't be confirmed.

## API

See the table in `docs/passport-contract.md` and the exact shapes in `src/types.ts`.
Call with the Firebase SDK, region `europe-west1`:

```js
const ask = httpsCallable(functions, "ask");
const { data } = await ask({ question: "When does payroll harmonisation go live in Belgium?", country: "BE" });
```

## Security checklist

- [x] Deny-by-default Firestore and Storage rules; clients never write directly
- [x] Auth check + zod validation in every function; generic errors only (details go to server logs)
- [x] Least privilege: curator claim for ingest, team membership for confirmation, no ID probing
- [x] Anthropic key only as a Firebase secret; source text passed to the model as data
- [x] EU region, `maxInstances` cap against cost abuse
- [x] Seed script can't run against production
- [ ] Run `npm audit` and an Aikido scan before submitting
- [ ] Optional for production: App Check (`enforceAppCheck: true`)
