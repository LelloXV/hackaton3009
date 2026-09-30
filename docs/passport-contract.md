# Knowledge Passport contract v1.0.0

This is the shared contract for importers, storage, trust evaluation and the UI.
The canonical field definitions are in `schemas/passport.schema.json`.
Use the JSON field names below unchanged. Examples are fictional, not payroll advice.

## Fields

Every top-level field is required. Explicit `null` and empty arrays describe missing
metadata; omitting a field is invalid. Unknown properties are rejected at every level.

| Field | Type / allowed values | Meaning |
| --- | --- | --- |
| `schemaVersion` | Exactly `"1.0.0"` | Contract version; independent of content version. |
| `id` | Stable identifier | Identity of this passport across revisions. |
| `title` | Nonempty string, at most 500 characters | Display title. |
| `issuer` | Actor | Person, team or system that created the passport; issuance is not verification. |
| `owner` | Actor or `null` | Accountable person/team; `null` means unassigned. A system cannot own knowledge. |
| `createdAt` | UTC timestamp | When the passport was first issued; immutable. |
| `updatedAt` | UTC timestamp | Last change to content, source, owner or visa; excludes appending audit stamps. |
| `lastVerifiedAt` | UTC timestamp or `null` | Last human verification of the current version; never inferred from edits. |
| `expiresAt` | UTC timestamp or `null` | Deadline for reviewing the current version; `null` means no known deadline. |
| `visa` | `{countries, clients, modules}` | Applicability of this version; each dimension is an explicit scope object. |
| `sourceType` | `document`, `chat`, `email`, `business_record`, `expert_note`, `generated_answer` | Kind of primary source. AI output requires human verification too. |
| `source` | `{id, uri}` | Stable primary source ID and absolute HTTPS link. |
| `version` | Integer >= 1 | Content revision; increment when content, source, owner or visa changes. |
| `stamps` | Array of stamp objects | Append-only audit history; an empty array is valid. |
| `linkedSources` | Array of linked source objects | Evidence and relationships; an empty array is valid. |

Identifiers are 1–128 characters: letters, digits, `.`, `_`, `:`, `-`, starting with
a letter or digit. Timestamps use `YYYY-MM-DDTHH:mm:ss[.fraction]Z`.
Reject impossible dates and enable JSON Schema format validation.

An **actor** has required `id`, `name`, `type` (`person`, `team`, `system`).
Display names can change; IDs must remain stable. Team ownership is allowed, but
verification and conflict resolution must name an individual person.

## Visa: explicit scope

Each dimension has required `mode` and `values`:

| Mode | Values | Interpretation |
| --- | --- | --- |
| `listed` | At least one distinct value | Applies only to listed values. |
| `all` | `[]` | Owner explicitly declared universal applicability for this dimension. |
| `unknown` | `[]` | Scope has not been established. Never treat as universal. |

Countries use uppercase ISO 3166-1 alpha-2 codes (`BE`, `NL`, etc.). The schema
checks their shape; applications must check membership in their shared country
registry. Clients use stable opaque client IDs, never display names. Modules are
locked to the demo's three pillars: `hr`, `pay`, `time`. Detailed product/module
taxonomies require a future contract revision.

For a query containing country, client and module, evaluate all three dimensions:
`all` matches, `listed` matches only on membership, `unknown` is indeterminate.
Any mismatch means out of scope. With no mismatch, any unknown dimension or missing
query dimension means scope is unknown. Only three definite matches mean in scope.
Visa is applicability metadata, not an access-control or permission mechanism.

## Stamps and linked sources

Every stamp requires `id`, `type`, `at`, `actor`, `version`, `note`,
`relatedStampIds`. Stamp types are:

| Type | Meaning |
| --- | --- |
| `verified` | A person checked this exact version, including its declared visa. |
| `conflict` | A contradiction needs review; explain it in `note` and link the evidence. |
| `conflict_resolved` | A person resolved earlier conflict stamps named in `relatedStampIds`. |
| `revoked` | This version must no longer be relied on. A new version is required to restore it. |
| `note` | Informational audit event; does not grant trust. |

`relatedStampIds` is empty except for `conflict_resolved`, which must reference at
least one earlier `conflict` stamp on the same version. Resolutions never certify
content; use a separate `verified` stamp. If resolution changes content, increment
the version and verify that new version. Historical stamps remain attached.

Each linked source requires `id`, `title`, `sourceType`, `uri`, `relation`.
Relations: `supports`, `contradicts`, `derived_from`, `supersedes`. They describe
the current version. A link alone does not prove verification or resolve conflict.
A `contradicts` link requires at least one current-version conflict stamp, which
may subsequently have a resolution. Source IDs must be unique within the passport
and distinct from the primary source ID.

## Lifecycle and trust rules

1. Import: assign an issuer and source, use version 1, and preserve unknown owner,
   dates and scope explicitly. Set `lastVerifiedAt: null`, `stamps: []` initially.
2. Edit content/source/owner/visa: increment `version`, update `updatedAt`, reset
   `lastVerifiedAt` and `expiresAt` to `null`, and retain historical stamps. Review
   current evidence links and carry unresolved conflicts into the new version as
   new conflict stamps. Incrementing the version must not silently clear disputes.
3. Verify: a person appends a `verified` stamp for the current version and sets
   `lastVerifiedAt` to that stamp's time. Set an explicit review deadline to claim
   that knowledge is current. Adding a stamp does not change `updatedAt` or version.
4. Conflict/revoke: append the appropriate stamp. An earlier verification cannot
   hide unresolved conflicts or revocation.

Validation has two layers: JSON Schema for structure, then application rules for
dates, ownership and stamp references. `scripts/validate_passports.py` implements
the latter rules for the demo fixtures. Producers must also enforce the revision
rules above against the previous stored version; one snapshot cannot prove them.

- `createdAt <= updatedAt <= now`; stamp times must be between creation and now.
- A stamp's version cannot exceed the current version. Current-version stamps
  must be at or after `updatedAt`. Stamp IDs are unique within the passport.
- `lastVerifiedAt` must equal the latest current-version `verified` stamp's time,
  or be `null` if no such stamp exists. Human verification requires an owner.
- A non-null expiry must be after `updatedAt` and, if set, `lastVerifiedAt`.
  Expired passports are valid records; flag them, rather than rejecting them.
- System actors cannot issue `verified` or `conflict_resolved` stamps.
- Conflict resolutions reference existing, earlier same-version conflicts.

Show independent trust signals instead of storing a guessed confidence score:

| Signal | Values / rule |
| --- | --- |
| Ownership | `assigned` or `unassigned`. |
| Verification | `verified` if a current-version human stamp exists; otherwise `unverified`. |
| Freshness | `expired` when `now >= expiresAt`; `current` only with verification and a future expiry; otherwise `unknown`. |
| Conflict | `unresolved` if any current-version conflict lacks a resolution; otherwise `clear`. |
| Revocation | `revoked` if a current-version revocation exists; otherwise `active`. |
| Applicability | `in_scope`, `out_of_scope`, `unknown`, using the query rules above. |

A positive overall badge requires assigned ownership, verified content, current
freshness, clear conflicts, active status and definite scope match. Expose the
reasons when any condition fails. These are workflow signals, not a guarantee
that payroll or legal content is correct.

## Builder handoff and changes

Importers emit the full shape. Storage retains stable IDs, revisions and stamps.
Trust logic consumes timestamps, visa and stamps. The UI displays the derived
signals, owner and evidence; it must not equate `updatedAt` with verification.

Version 1.0.0 is the proposed baseline for team review. Once adopted, coordinate
contract changes through `schemaVersion`; do not rename fields independently.
Breaking field/enum/semantic changes require a new major contract version and
migration. Extra optional fields require a coordinated minor release because old
validators reject unknown fields. Editorial fixes can use a patch release.

## Validate the examples

```sh
python3 -m venv /tmp/hackaton-passport-venv
/tmp/hackaton-passport-venv/bin/pip install -r scripts/requirements.txt
/tmp/hackaton-passport-venv/bin/python scripts/validate_passports.py
/tmp/hackaton-passport-venv/bin/python -m unittest discover -s tests
```

Validation uses a supplied `--now` timestamp when reproducible runs are needed.
Fixtures cover verified knowledge, unowned/unknown knowledge and a verified
document with an unresolved conflict. They remain structurally valid after expiry.
