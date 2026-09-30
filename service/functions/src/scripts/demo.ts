// Runs the trust scoring on the demo data WITHOUT Firebase: npm run demo
// Handy to tune the weights and to show the logic in the pitch.
import { rankSources } from "../scoring";
import { DEMO_QUESTION, SEED_SOURCES } from "../seedData";
import { chunkText, sha256, terms } from "../text";
import { Chunk, Passport } from "../types";

const passports: Passport[] = SEED_SOURCES.map(({ text, ...s }) => ({
  ...s,
  sha256: sha256(text),
  ingestedAt: "2026-09-30T00:00:00Z",
  ingestedBy: "demo",
}));
const chunks: Chunk[] = SEED_SOURCES.flatMap((s) =>
  chunkText(s.text).map((text, position) => ({ passportId: s.id, position, text, terms: terms(text) })),
);

const now = new Date(process.argv[2] ?? "2026-09-30T12:00:00Z");
console.log(JSON.stringify(rankSources(passports, chunks, DEMO_QUESTION, now), null, 2));
