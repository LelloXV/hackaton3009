# Knowledge Passport contract v1.1.0

This is the shared contract for importers, storage, trust evaluation and the UI.
The canonical field definitions are in `schemas/passport.schema.json`; the backend
types are in `service/functions/src/types.ts` and must stay identical.
Use the JSON field names below unchanged. Examples are fictional, not payroll advice.

A passport describes a **project** (or a single document) together with the sources
behind it. The layout the UI shows is `prototype of passport.png`.

## What changed in v1.1.0

- New fields: `reference`, `description`, `updatedBy`, `departments`, `openIssues`,
  `updates`, `related`; new source type `project`; linked sources gain `app`,
  `version`, `updatedAt` and `countries`.
- **Team ownership.** The owner should be a team. Every member of the owning team
  can update and confirm the passport, so work continues when someone changes role
  or leaves. Verification stamps still name the individual person.
- **Archive.** `expiresAt` now means *relevant until*. After that moment the passport
  is **archived**: still readable, never used to answer questions.
- **Trust score.** The backend computes a 0–100 score from 7 criteria (below). It is
  returned by the API and never stored in the passport.

## Fields

Every top-level field is required. Explicit `null` and empty arrays describe missing
metadata; omitting a field is invalid. Unknown properties are rejected at every level.

| Field | Type / allowed values | Meaning |
| --- | --- | --- |
| `schemaVersion` | Exactly `"1.1.0"` | Contract version; independent of content version. |
| `id` | Stable identifier | Identity of this passport across revisions. |
| `reference` | String ≤ 50 or `null` | Short human reference, e.g. an issue number `"#241"`. |
| `title` | Nonempty string ≤ 500 | Display title. |
| `description` | Nonempty string ≤ 1000 | One or two sentences under the title. |
| `issuer` | Actor | Person, team or system that created the passport; issuance is not verification. |
| `owner` | Actor or `null` | Accountable team (preferred) or person; `null` means unassigned. A system cannot own knowledge. |
| `createdAt` | UTC timestamp | When the passport was first issued; immutable. |
| `updatedAt` | UTC timestamp | Last change to content, sources, owner or visa; excludes appending stamps. |
| `updatedBy` | Actor or `null` | Who made the last change. |
| `lastVerifiedAt` | UTC timestamp or `null` | Last human verification of the current version; never inferred from edits. |
| `expiresAt` | UTC timestamp or `null` | Relevant until. Afterwards the passport is archived. `null` = no known end. |
| `visa` | `{countries, clients, modules}` | Applicability of this version; each dimension is an explicit scope object. |
| `departments` | Array of strings | Departments involved, e.g. `"Pay · Payroll Operations"`. First one is the main one. |
| `sourceType` | `project`, `document`, `chat`, `email`, `business_record`, `expert_note`, `generated_answer` | Kind of primary source. |
| `source` | `{id, uri}` | Stable primary source ID and absolute HTTPS link (e.g. the project issue). |
| `version` | Integer ≥ 1 | Content revision; increment when content, sources, owner or visa change. |
| `stamps` | Array of stamp objects | Append-only audit history; an empty array is valid. |
| `linkedSources` | Array of linked source objects | The key sources behind the passport. |
| `openIssues` | Array of `{id, title, severity, openedAt}` | Known gaps; `severity` is `minor` or `major`. |
| `updates` | Array of `{version, at, actor, summary}` | What changed in each version compared to the previous one. Must include the current version. |
| `related` | Array of `{passportId, title, relation}` | Other passports, e.g. `"Country workstream"`, `"Replaced by"`. |

Identifiers are 1–128 characters: letters, digits, `.`, `_`, `:`, `-`, starting with
a letter or digit. Timestamps use `YYYY-MM-DDTHH:mm:ss[.fraction]Z`.

An **actor** has required `id`, `name`, `type` (`person`, `team`, `system`).
Display names can change; IDs must remain stable.

## Ownership and the team directory

Who belongs to which team is application data (`teams` collection in the backend:
`{id, name, lead, members, expertise}`), not part of the passport.

- Any member of the owning team may confirm or change the passport.
- If the owner is a person, only that person may; this scores lower (see *Owner (unit)*).
- When someone leaves, the team keeps ownership: no passport becomes orphaned.
- "Who can clarify" and "Who to contact" point to the lead of the owning team.

## Visa: explicit scope

Each dimension has required `mode` and `values`:

| Mode | Values | Interpretation |
| --- | --- | --- |
| `listed` | At least one distinct value | Applies only to listed values. |
| `all` | `[]` | Owner explicitly declared universal applicability for this dimension. |
| `unknown` | `[]` | Scope has not been established. Never treat as universal. |

Countries use uppercase ISO 3166-1 alpha-2 codes. Clients use stable opaque client IDs.
Modules are `hr`, `pay`, `time`. For a question with a country or client, a `listed`
dimension that does not contain it makes the passport **out of scope**: it is still
shown, last, with the reason, but not used for the answer.

## Stamps and linked sources

Every stamp requires `id`, `type`, `at`, `actor`, `version`, `note`, `relatedStampIds`:

| Type | Meaning |
| --- | --- |
| `verified` | A person of the owning team checked this exact version ("Confirm still valid"). |
| `conflict` | A contradiction needs review. Start `note` with a short topic and a colon, e.g. `"Conflicting go-live date: …"`; the topic is shown in the UI. |
| `conflict_resolved` | A person resolved earlier conflict stamps named in `relatedStampIds`. |
| `revoked` | This version must no longer be relied on. |
| `note` | Informational audit event; does not grant trust. |

`relatedStampIds` is empty except for `conflict_resolved`, which must reference at
least one earlier `conflict` stamp on the same version. Resolutions never certify
content; use a separate `verified` stamp.

Each linked source requires `id`, `title`, `sourceType`, `app` (tool, e.g.
`"SharePoint"`, or `null`), `version` (or `null`), `updatedAt` (or `null`),
`countries` (countries the source covers, `[]` if not stated), `uri`, `relation`.
Relations: `supports`, `contradicts`, `derived_from`, `supersedes`. Only `supports`
and `contradicts` sources count as evidence when answering questions. A
`contradicts` link requires a current-version conflict stamp. The same source may
be linked from several passports.

## Lifecycle

1. **Create:** version 1, one `updates` entry, `lastVerifiedAt: null`, `stamps: []`.
2. **Edit** content, sources, owner or visa: increment `version`, add an `updates`
   entry saying what changed, update `updatedAt`/`updatedBy`, reset `lastVerifiedAt`
   to `null`. Carry unresolved conflicts into the new version as new conflict stamps.
3. **Confirm still valid:** a member of the owning team appends a `verified` stamp for
   the current version and `lastVerifiedAt` becomes its time. Open conflicts stay open.
4. **Archive:** when `expiresAt` passes (project finished, no longer relevant), the
   passport is archived automatically. It stays valid and readable; archived passports
   cannot be confirmed and are never used to answer questions.

## Trust score (computed by the backend)

7 criteria, 100 points in total (`WEIGHTS` in `service/functions/src/scoring.ts`):

| Criterion | Max | Full points | Partial | Zero |
| --- | --- | --- | --- | --- |
| Sources agree | 20 | No open conflict on the current version | — | Open conflict (status `conflict`) |
| Last updated | 20 | ≤ 3 months ago | 3–6 months: 10 | > 6 months (`stale`) |
| Owner (unit) | 15 | A team | A person: 8 | No owner (`missing`) |
| Scope coverage | 15 | Sources cover every listed country (or visa is `all`) | Proportional, e.g. 15/17 countries → 13; no source states countries → 8 | Countries unknown |
| Owner review | 10 | Current version verified ≤ 3 months ago | Last verification ≤ 6 months: 5 (`stale`) | Older or never |
| Department defined | 10 | At least one department | — | None |
| Open issues | 10 | None | Only minor issues: 5 | A major issue (`missing`) |

Level: **high** ≥ 80, **medium** 50–79, **low** < 50. Each criterion is returned with
`points`, `status` (`ok`, `partial`, `stale`, `missing`, `conflict`) and a short
`details` text. The score is a workflow signal, not a guarantee that payroll or legal
content is correct.

## API (Firebase callable functions, region `europe-west1`)

| Function | Input | Output |
| --- | --- | --- |
| `ask` | `{ question, country?, client? }` | `AskResult`: answer with `[n]` citations, `confidence`, `results`, `archived`, `conflicts`, `uncertainty`, `whoToContact` |
| `getPassport` | `{ passportId }` | `{ passport, trust, archived }` |
| `confirmStillValid` | `{ passportId }` | `{ passport, trust, archived }` |
| `askPassportAI` | `{ passportId, message }` | `{ answer, citations: [{ id, title }] }` |
| `ingest` (curators) | `{ passport, sourceTexts }` | `{ passport, trust, archived }` |

Exact shapes: `service/functions/src/types.ts`. Example responses:
`frontend/src/data/generated/*.json` (produced by `npm run export-mocks`).

## Validate

```sh
python3 -m venv /tmp/hackaton-passport-venv
/tmp/hackaton-passport-venv/bin/pip install -r scripts/requirements.txt
/tmp/hackaton-passport-venv/bin/python scripts/validate_passports.py
/tmp/hackaton-passport-venv/bin/python -m unittest discover -s tests
```

Validation has two layers: JSON Schema for structure, then application rules for
dates, ownership, stamps and updates (`scripts/validate_passports.py`). Pass `--now`
for reproducible runs. Contract changes go through `schemaVersion`; do not rename
fields independently.
