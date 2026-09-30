# Knowledge Passport: frontend

React + Vite + Tailwind. Shows answers with trust scores, conflicts, and a passport
page per project (see `prototype of passport.png`). Contract: `docs/passport-contract.md`.

## Two ways to run it

### 1. Demo mode (no backend)

```bash
npm install
npm run dev
```

Uses example data in `src/data/generated/`, exported from the backend's real code
(`npm run export-mocks` in `service/functions`). Every question returns the go-live
example for the chosen country.

### 2. Connected to the Firebase backend (local emulators)

Needs Node, Java 11+ and the Firebase CLI (`npm install -g firebase-tools`).

1. Start the backend (terminal 1):
   ```bash
   cd service/functions && npm install && npm run build && cd ..
   firebase emulators:start --only auth,functions,firestore
   ```
2. Load the demo data and accounts (terminal 2). Choose any password of 8+ characters:
   ```bash
   cd service/functions
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
   GCLOUD_PROJECT=hackaton3009 DEMO_PASSWORD=your-password npm run seed
   ```
3. Configure the frontend: copy `.env.example` to `.env.local` (not committed) and set
   `VITE_DEMO_PASSWORD` to the same password.
4. Start the frontend (terminal 3):
   ```bash
   cd frontend && npm run dev
   ```

The login screen says "Connected to the Firebase backend". Questions are now really
searched, confirmations are saved, and the emulator UI (http://127.0.0.1:4000) shows
the data and accounts.

## Where things are

- `src/api.js`: the only place that talks to the backend (or the demo data).
- `src/firebase.js`: Firebase setup from `.env.local`.
- `src/screens/`: Login, answer screen, conflict panel, passport page.
- `src/components/`: badges, result cards, the "Ask AI" chat.
