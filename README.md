# SD Worx hackathon: knowledge passports

Shared contract for making ownership, freshness, verification and applicability
visible on organisational knowledge.

- [Passport contract and builder handoff](docs/passport-contract.md)
- [JSON Schema v1.0.0](schemas/passport.schema.json)
- [Example passports](examples/passports)
- [Challenge problem definition](problem_definition.md)

The contract is a proposed baseline for team review. The examples are fictional.
Validation setup and commands are documented in the contract.

## Interactive demo app

A browser-only chat and project passport demo inspired by the concept mockup.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173). Select any of
10 suggested questions, or type a question about status, ownership, go-live,
countries, confidence, issues, updates, sources, conflicts or next steps.
The demo consolidates four fictional local resources and generates a dashboard.
Source cards and answer citations open the full dummy source; the confidence
info button explains all seven weighted checks. Sources and Activity tabs show
the underlying resources and timeline. Export downloads a demo passport JSON.
Reset clears the chat while retaining the latest passport.

The answers and confidence assessments are deterministic demo data, not an AI
integration. All dates are assessed against the demo snapshot of 30 Sep 2026.
The exported demo JSON is a UI snapshot, not a document conforming to the shared
passport schema. The original contract and Python validation remain unchanged.
Google Fonts is optional; local font fallbacks work when offline.

```sh
npm run build
npm run preview
```
