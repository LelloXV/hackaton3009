import copy
import json
import unittest

from scripts.validate_passports import ROOT, timestamp, validate


class PassportContractTest(unittest.TestCase):
    def setUp(self):
        self.passport = json.loads((ROOT / "examples/passports/verified.json").read_text())
        self.now = timestamp("2026-09-30T12:00:00Z")

    def test_examples_and_expired_records_are_valid(self):
        for path in (ROOT / "examples/passports").glob("*.json"):
            passport = json.loads(path.read_text())
            self.assertEqual(validate(passport, self.now), [], path.name)
            self.assertEqual(validate(passport, timestamp("2027-01-01T00:00:00Z")), [], path.name)

    def test_rejects_ambiguous_scope_and_invalid_metadata(self):
        mutations = [
            lambda p: p.pop("owner"),
            lambda p: p.update(confidence=100),
            lambda p: p["visa"]["countries"].update(mode="all", values=["BE"]),
            lambda p: p["visa"]["clients"].update(mode="listed", values=[]),
            lambda p: p["visa"]["modules"].update(mode="listed", values=["payroll"]),
            lambda p: p.update(createdAt="2026-02-30T09:00:00Z"),
            lambda p: p.update(updatedAt="2026-10-01T09:00:00Z"),
            lambda p: p["source"].update(uri="file:///private/source"),
            lambda p: p.update(owner=None),
            lambda p: p["owner"].update(type="system"),
            lambda p: p["stamps"][0]["actor"].update(type="system"),
            lambda p: p.update(version=3),
            lambda p: p.update(lastVerifiedAt=None),
            lambda p: p.update(expiresAt="2026-09-28T09:00:00Z"),
            lambda p: p["stamps"][0].update(version=3),
            lambda p: p["stamps"][0].update(at="2026-09-02T09:00:00Z"),
        ]
        for mutate in mutations:
            with self.subTest(mutation=mutate):
                passport = copy.deepcopy(self.passport)
                mutate(passport)
                self.assertTrue(validate(passport, self.now))

    def test_conflict_resolution_requires_existing_earlier_conflict(self):
        passport = json.loads((ROOT / "examples/passports/conflicted.json").read_text())
        resolution = {
            "id": "stamp.resolution", "type": "conflict_resolved",
            "at": "2026-09-30T11:00:00Z", "actor": passport["owner"],
            "version": 2, "note": "Demo review completed.",
            "relatedStampIds": ["stamp.be.conflict.v2"],
        }
        passport["stamps"].append(resolution)
        self.assertEqual(validate(passport, self.now), [])
        for reference in ("missing", "stamp.be.verified.v2", "stamp.resolution"):
            resolution["relatedStampIds"] = [reference]
            self.assertTrue(validate(passport, self.now))

    def test_duplicate_ids_and_unrecorded_contradictions_are_rejected(self):
        passport = json.loads((ROOT / "examples/passports/conflicted.json").read_text())
        passport["stamps"].pop()
        self.assertTrue(validate(passport, self.now))
        passport = copy.deepcopy(self.passport)
        duplicate = copy.deepcopy(passport["stamps"][0])
        duplicate["note"] = "Different note with the same ID"
        passport["stamps"].append(duplicate)
        self.assertTrue(validate(passport, self.now))
