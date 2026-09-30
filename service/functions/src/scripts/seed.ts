// Loads the fictional demo sources into the LOCAL EMULATOR.
// Run: npm run seed   (with `firebase emulators:start` running in another terminal)
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_SOURCES } from "../seedData";
import { storeSource } from "../store";

// Safety: refuse to touch a real project. Seeding is for the emulator only.
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("FIRESTORE_EMULATOR_HOST is not set. Refusing to seed a real database.");
  process.exit(1);
}

async function main() {
  initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? "demo-trust-passport" });
  const db = getFirestore();
  for (const { id, ...input } of SEED_SOURCES) {
    const p = await storeSource(db, input, "seed-script", id);
    console.log(`✓ ${p.id}  (${p.title})`);
  }
  console.log(`Seeded ${SEED_SOURCES.length} sources.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
