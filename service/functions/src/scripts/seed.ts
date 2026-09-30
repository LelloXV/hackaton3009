// Loads the fictional demo passports, teams and demo sign-in accounts into the LOCAL EMULATORS.
// Run (with `firebase emulators:start` running in another terminal):
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
//   GCLOUD_PROJECT=hackaton3009 DEMO_PASSWORD=<choose one> npm run seed
// The password is never stored in code: pass the same value to the frontend's .env.local.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_PASSPORTS, TEAMS } from "../seedData";
import { storePassport, storeTeam } from "../store";

// Safety: refuse to touch a real project. Seeding is for the emulators only.
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error("FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST must be set. Refusing to seed a real project.");
  process.exit(1);
}
const password = process.env.DEMO_PASSWORD ?? "";
if (password.length < 8) {
  console.error("Set DEMO_PASSWORD (at least 8 characters) for the demo accounts.");
  process.exit(1);
}

// Demo accounts: every team member, plus a consultant who is in no team.
const ACCOUNTS = [
  { uid: "person.sofie-vandamme", name: "Sofie Van Damme", email: "sofie.vandamme@example.com" },
  ...TEAMS.flatMap((t) => t.members.map((m) => ({ uid: m.id, name: m.name, email: m.email }))),
];

async function main() {
  initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? "demo-trust-passport" });
  const db = getFirestore();
  const auth = getAuth();

  for (const team of TEAMS) {
    await storeTeam(db, team);
    console.log(`✓ team ${team.id}`);
  }
  for (const { passport, sourceTexts } of SEED_PASSPORTS) {
    await storePassport(db, passport, sourceTexts);
    console.log(`✓ ${passport.id}  (${passport.title})`);
  }
  for (const a of ACCOUNTS) {
    const user = { email: a.email, emailVerified: true, displayName: a.name, password };
    try {
      await auth.updateUser(a.uid, user);
    } catch {
      await auth.createUser({ uid: a.uid, ...user });
    }
    console.log(`✓ account ${a.email}`);
  }
  console.log(`Seeded ${TEAMS.length} teams, ${SEED_PASSPORTS.length} passports and ${ACCOUNTS.length} accounts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
