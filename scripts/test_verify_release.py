#!/usr/bin/env python3
"""Meaningful regression tests for the standalone release verifier."""

from __future__ import annotations

import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("verify_release.py")


class VerifyReleaseTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.root = self.base / "game"
        self.root.mkdir()
        self.files = {"index.html": b"<main>play</main>", "game.js": b"console.log('play')"}
        for relative, body in self.files.items():
            (self.root / relative).write_bytes(body)
        self.manifest = self.base / "manifest.json"
        self.network = self.base / "network.json"
        self.write_manifest()
        self.network.write_text(json.dumps({"responses": [{"path": f"/game/{name}", "encodedBodySize": len(body)} for name, body in self.files.items()]}), encoding="utf-8")

    def tearDown(self) -> None:
        self.temp.cleanup()

    def write_manifest(self, limit: int = 5_000_000, enforce: bool = False) -> None:
        self.manifest.write_text(json.dumps({"schemaVersion": 1, "publicBasePath": "/game/", "budget": {"encodedInitialGameplayBytes": limit, "enforce": enforce}, "entryPoints": ["index.html"], "files": [{"path": name, "sha256": hashlib.sha256(body).hexdigest()} for name, body in self.files.items()], "fallbackGroups": []}), encoding="utf-8")

    def run_verify(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(["python3", str(SCRIPT), "--root", str(self.root), "--manifest", str(self.manifest), "--network", str(self.network), "--require-network"], text=True, capture_output=True, check=False)

    def test_valid_release_passes(self) -> None:
        result = self.run_verify()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_hash_drift_fails(self) -> None:
        (self.root / "game.js").write_text("changed", encoding="utf-8")
        self.assertIn("sha256 mismatch", self.run_verify().stderr)

    def test_unknown_network_file_fails(self) -> None:
        data = json.loads(self.network.read_text(encoding="utf-8"))
        data["responses"].append({"path": "/game/ghost.js", "encodedBodySize": 5})
        self.network.write_text(json.dumps(data), encoding="utf-8")
        self.assertIn("unlisted first-party", self.run_verify().stderr)

    def test_hard_budget_fails_and_soft_budget_warns(self) -> None:
        self.write_manifest(limit=1, enforce=True)
        self.assertNotEqual(self.run_verify().returncode, 0)
        self.write_manifest(limit=1, enforce=False)
        result = self.run_verify()
        self.assertEqual(result.returncode, 0)
        self.assertIn("soft optimization", result.stderr)

    def test_large_external_response_counts_toward_budget(self) -> None:
        self.write_manifest(limit=100, enforce=True)
        data = json.loads(self.network.read_text(encoding="utf-8"))
        data["responses"].append({"path": "https://cdn.example/game-runtime.js", "encodedBodySize": 200, "external": True})
        self.network.write_text(json.dumps(data), encoding="utf-8")
        result = self.run_verify()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("encoded initial gameplay load", result.stderr)

    def test_empty_required_network_evidence_fails(self) -> None:
        self.network.write_text(json.dumps({"responses": []}), encoding="utf-8")
        result = self.run_verify()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("no measurable first-party entry-point", result.stderr)


if __name__ == "__main__":
    unittest.main()
