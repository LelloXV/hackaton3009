// Writes the frontend's mock data from the REAL backend logic: npm run export-mocks
// The frontend then shows exactly what the backend would return (same shapes, same numbers).
// Output: frontend/src/data/generated/*.json. Do not edit those files by hand.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { confirmPassport } from "../access";
import { answerQuestion, evaluateTrust, isArchived } from "../scoring";
import { DEMO_NOW, DEMO_QUESTION, SEED_PASSPORTS, TEAMS } from "../seedData";
import { buildChunks } from "../store";
import { Passport } from "../types";

const OUT = join(__dirname, "../../../../frontend/src/data/generated");
const COUNTRIES = ["BE", "NL"];
// Demo action: Jane De Smet (Transformation Office) confirms the Global Payroll Harmonisation passport.
const CONFIRMED_ID = "passport.global-payroll-harmonisation";
const CONFIRMED_BY = { id: "person.jane-desmet", name: "Jane De Smet" };

const chunks = SEED_PASSPORTS.flatMap((s) => buildChunks(s.passport, s.sourceTexts));
const before = SEED_PASSPORTS.map((s) => s.passport);
const after = before.map((p) => (p.id === CONFIRMED_ID ? confirmPassport(p, CONFIRMED_BY, DEMO_NOW) : p));

function scenario(passports: Passport[]) {
  return {
    ask: Object.fromEntries(
      COUNTRIES.map((country) => [country, answerQuestion(passports, chunks, TEAMS, { ...DEMO_QUESTION, country }, DEMO_NOW)]),
    ),
    passports: Object.fromEntries(
      // canEdit depends on who is signed in; the frontend mock fills it in per demo user.
      passports.map((p) => [p.id, { passport: p, trust: evaluateTrust(p, DEMO_NOW), archived: isArchived(p, DEMO_NOW), canEdit: false }]),
    ),
  };
}

mkdirSync(OUT, { recursive: true });
const files: Record<string, unknown> = {
  "meta.json": { generatedFrom: "service/functions/src/seedData.ts", now: DEMO_NOW.toISOString(), question: DEMO_QUESTION, confirmedPassportId: CONFIRMED_ID },
  "teams.json": TEAMS,
  "before.json": scenario(before),
  "afterConfirm.json": scenario(after),
};
for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(OUT, name), JSON.stringify(data, null, 2) + "\n");
  console.log(`✓ ${join(OUT, name)}`);
}
// Passport files the contract validator can check: python3 scripts/validate_passports.py <files>
mkdirSync(join(OUT, "passports"), { recursive: true });
for (const p of before) writeFileSync(join(OUT, "passports", `${p.id}.json`), JSON.stringify(p, null, 2) + "\n");
