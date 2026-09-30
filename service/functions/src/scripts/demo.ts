// Runs the trust scoring on the demo data WITHOUT Firebase: npm run demo [country] [ISO date]
// Handy to tune the weights and to show the logic in the pitch.
import { answerQuestion } from "../scoring";
import { DEMO_NOW, DEMO_QUESTION, SEED_PASSPORTS, TEAMS } from "../seedData";
import { buildChunks } from "../store";

const passports = SEED_PASSPORTS.map((s) => s.passport);
const chunks = SEED_PASSPORTS.flatMap((s) => buildChunks(s.passport, s.sourceTexts));
const country = process.argv[2] ?? DEMO_QUESTION.country;
const now = process.argv[3] ? new Date(process.argv[3]) : DEMO_NOW;

console.log(JSON.stringify(answerQuestion(passports, chunks, TEAMS, { ...DEMO_QUESTION, country }, now), null, 2));
