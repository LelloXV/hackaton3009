"""Validate passport structure and snapshot semantics; no network calls."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / "schemas/passport.schema.json").read_text())
Draft202012Validator.check_schema(SCHEMA)


def timestamp(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


FORMATS = FormatChecker()


@FORMATS.checks("date-time", raises=ValueError)
def valid_timestamp(value):
    if not isinstance(value, str):
        return True
    return timestamp(value).tzinfo is not None


VALIDATOR = Draft202012Validator(SCHEMA, format_checker=FORMATS)


def validate(passport, now=None):
    errors = [f"{error.json_path}: {error.message}"
              for error in VALIDATOR.iter_errors(passport)]
    if errors:
        return errors
    now = now or datetime.now(timezone.utc)
    created, updated = map(timestamp, [passport["createdAt"], passport["updatedAt"]])
    if not created <= updated <= now:
        errors.append("Expected createdAt <= updatedAt <= now")
    owner = passport["owner"]
    if owner and owner["type"] == "system":
        errors.append("owner must be a person, a team, or null")
    stamps = passport["stamps"]
    by_id = {stamp["id"]: stamp for stamp in stamps}
    if len(by_id) != len(stamps):
        errors.append("Stamp IDs must be unique")
    current = [stamp for stamp in stamps if stamp["version"] == passport["version"]]
    for stamp in stamps:
        at = timestamp(stamp["at"])
        if not created <= at <= now:
            errors.append(f"{stamp['id']}: stamp time must be between creation and now")
        if stamp["version"] > passport["version"]:
            errors.append(f"{stamp['id']}: stamp references a future version")
        if stamp["version"] == passport["version"] and at < updated:
            errors.append(f"{stamp['id']}: current-version stamp predates updatedAt")
        if stamp["type"] in ("verified", "conflict_resolved") and stamp["actor"]["type"] != "person":
            errors.append(f"{stamp['id']}: requires an individual human actor")
        if stamp["type"] != "conflict_resolved" and stamp["relatedStampIds"]:
            errors.append(f"{stamp['id']}: only resolutions can reference stamps")
        for related_id in stamp["relatedStampIds"]:
            related = by_id.get(related_id)
            if (related is None or related["type"] != "conflict"
                    or related["version"] != stamp["version"]
                    or timestamp(related["at"]) >= at):
                errors.append(f"{stamp['id']}: resolution must reference an earlier same-version conflict")
    verifications = [stamp for stamp in current if stamp["type"] == "verified"]
    expected = max((timestamp(stamp["at"]) for stamp in verifications), default=None)
    actual = timestamp(passport["lastVerifiedAt"]) if passport["lastVerifiedAt"] else None
    if actual != expected:
        errors.append("lastVerifiedAt must match latest current-version verification, or be null")
    if verifications and owner is None:
        errors.append("Current verification requires an assigned owner")
    expiry = timestamp(passport["expiresAt"]) if passport["expiresAt"] else None
    if expiry and (expiry <= updated or (actual and expiry <= actual)):
        errors.append("expiresAt must follow updatedAt and lastVerifiedAt")
    linked_ids = [source["id"] for source in passport["linkedSources"]]
    if len(set(linked_ids)) != len(linked_ids) or passport["source"]["id"] in linked_ids:
        errors.append("Linked source IDs must be distinct from each other and the primary source")
    if any(source["relation"] == "contradicts" for source in passport["linkedSources"]):
        if not any(stamp["type"] == "conflict" for stamp in current):
            errors.append("Contradicting evidence requires a current-version conflict stamp")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--now", type=timestamp)
    args = parser.parse_args()
    paths = args.paths or sorted((ROOT / "examples/passports").glob("*.json"))
    failures = 0
    for path in paths:
        try:
            errors = validate(json.loads(path.read_text()), now=args.now)
        except (OSError, ValueError) as error:
            errors = [str(error)]
        print(f"{'FAIL' if errors else 'OK'} {path.name}")
        for error in errors:
            print(f"  {error}")
        failures += bool(errors)
    return int(failures > 0)


if __name__ == "__main__":
    raise SystemExit(main())
