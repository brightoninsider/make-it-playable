#!/usr/bin/env python3
"""Verify a browser-game release allowlist, hashes, fallbacks, and network budget."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import unquote, urlparse


def fail(message: str) -> None:
    raise ValueError(message)


def clean_relative(value: str) -> str:
    candidate = PurePosixPath(value.replace("\\", "/"))
    if candidate.is_absolute() or ".." in candidate.parts or value in {"", "."}:
        fail(f"unsafe or empty relative path: {value!r}")
    return candidate.as_posix()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_object(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        fail(f"expected a JSON object in {path}")
    return value


def manifest_files(manifest: dict[str, Any]) -> dict[str, dict[str, Any]]:
    if manifest.get("schemaVersion") != 1:
        fail("manifest schemaVersion must be 1")
    rows = manifest.get("files")
    if not isinstance(rows, list) or not rows:
        fail("manifest files must be a non-empty array")
    result: dict[str, dict[str, Any]] = {}
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str):
            fail("every manifest file needs a string path")
        relative = clean_relative(row["path"])
        if relative in result:
            fail(f"duplicate manifest file: {relative}")
        result[relative] = row
    return result


def package_files(root: Path) -> set[str]:
    files: set[str] = set()
    for path in root.rglob("*"):
        if path.is_symlink():
            fail(f"release package contains a symlink: {path.relative_to(root)}")
        if path.is_file():
            files.add(path.relative_to(root).as_posix())
    return files


def network_rows(network: dict[str, Any]) -> list[dict[str, Any]]:
    if isinstance(network.get("responses"), list):
        return [row for row in network["responses"] if isinstance(row, dict)]
    log = network.get("log")
    if not isinstance(log, dict) or not isinstance(log.get("entries"), list):
        fail("network JSON needs responses[] or HAR-like log.entries[]")
    rows: list[dict[str, Any]] = []
    for entry in log["entries"]:
        if not isinstance(entry, dict):
            continue
        request, response = entry.get("request", {}), entry.get("response", {})
        if isinstance(request, dict) and isinstance(response, dict):
            rows.append({
                "path": request.get("url"),
                "encodedBodySize": response.get("encodedBodySize", response.get("encodedDataLength", response.get("bodySize"))),
                "external": entry.get("external", False),
            })
    return rows


def request_path(value: str, public_base: str) -> str | None:
    parsed = urlparse(value)
    if parsed.scheme in {"data", "blob", "chrome-extension"}:
        return None
    path = unquote(parsed.path or value).lstrip("/")
    base = public_base.strip("/")
    if base:
        prefix = f"{base}/"
        if path == base:
            path = "index.html"
        elif path.startswith(prefix):
            path = path[len(prefix):]
        else:
            fail(f"first-party request is outside publicBasePath {public_base!r}: {value}")
    if not path or path.endswith("/"):
        path += "index.html"
    return clean_relative(path)


def verify(root: Path, manifest_path: Path, network_path: Path | None, require_network: bool, print_hashes: bool) -> int:
    if not root.is_dir():
        fail(f"release root is not a directory: {root}")
    manifest = load_object(manifest_path)
    expected = manifest_files(manifest)
    if print_hashes:
        print(json.dumps({path: sha256(root / path) for path in expected}, indent=2, sort_keys=True))
        return 0
    actual = package_files(root)
    missing, extra = set(expected) - actual, actual - set(expected)
    if missing:
        fail(f"missing allowlisted files: {', '.join(sorted(missing))}")
    if extra:
        fail(f"unlisted package files: {', '.join(sorted(extra))}")
    for relative, row in expected.items():
        wanted = row.get("sha256")
        if not isinstance(wanted, str) or len(wanted) != 64 or any(char not in "0123456789abcdef" for char in wanted):
            fail(f"invalid sha256 in manifest: {relative}")
        if sha256(root / relative) != wanted:
            fail(f"sha256 mismatch for {relative}")
    entries = manifest.get("entryPoints")
    if not isinstance(entries, list) or not entries or any(not isinstance(entry, str) or clean_relative(entry) not in expected for entry in entries):
        fail("entryPoints must be a non-empty allowlisted path array")
    entry_paths = {clean_relative(entry) for entry in entries}
    groups = manifest.get("fallbackGroups", [])
    if not isinstance(groups, list):
        fail("fallbackGroups must be an array")
    for group in groups:
        if not isinstance(group, dict) or not isinstance(group.get("primary"), str) or not isinstance(group.get("alternatives"), list):
            fail("every fallback group needs primary and alternatives")
        paths = [group["primary"], *group["alternatives"]]
        if not group["alternatives"] or any(not isinstance(path, str) or clean_relative(path) not in expected for path in paths):
            fail("fallback group paths must be allowlisted")
    network_bytes: int | None = None
    if network_path:
        network_bytes = 0
        measured_entry_points: set[str] = set()
        for row in network_rows(load_object(network_path)):
            raw_path, size = row.get("path"), row.get("encodedBodySize")
            if not isinstance(raw_path, str) or not isinstance(size, int) or size < 0:
                fail("every network response needs a path and non-negative encodedBodySize")
            network_bytes += size
            if row.get("external") is True:
                continue
            relative = request_path(raw_path, str(manifest.get("publicBasePath", "/")))
            if relative is not None:
                if relative not in expected:
                    fail(f"network requested an unlisted first-party file: {relative}")
                if relative in entry_paths:
                    measured_entry_points.add(relative)
        if require_network and not measured_entry_points:
            fail("network evidence has no measurable first-party entry-point response")
        budget = manifest.get("budget", {})
        limit = budget.get("encodedInitialGameplayBytes") if isinstance(budget, dict) else None
        enforce = budget.get("enforce", False) if isinstance(budget, dict) else None
        if not isinstance(limit, int) or limit <= 0 or not isinstance(enforce, bool):
            fail("budget needs a positive encodedInitialGameplayBytes and boolean enforce")
        if network_bytes > limit:
            message = f"encoded initial gameplay load is {network_bytes:,} bytes; target is {limit:,} bytes"
            if enforce:
                fail(message)
            print(f"WARNING: {message}; soft optimization target exceeded", file=sys.stderr)
    elif require_network:
        fail("--require-network needs --network")
    package_bytes = sum((root / path).stat().st_size for path in expected)
    summary = f"PASS: {len(expected)} files, {package_bytes:,} package bytes"
    if network_bytes is not None:
        summary += f", {network_bytes:,} encoded initial-gameplay bytes"
    print(summary)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--network", type=Path)
    parser.add_argument("--require-network", action="store_true")
    parser.add_argument("--print-hashes", action="store_true")
    args = parser.parse_args()
    try:
        return verify(args.root.resolve(), args.manifest.resolve(), args.network.resolve() if args.network else None, args.require_network, args.print_hashes)
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
