#!/usr/bin/env python3
"""Create a clean one-folder Make It Playable ZIP with manifest and checksum."""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path


DEFAULT_EXCLUDED_PARTS = {".git", "dist", "node_modules", "__pycache__", ".pytest_cache", ".playwright", "evidence", "screenshots", "videos", "private"}
ZIP_TIMESTAMP = (2026, 1, 1, 0, 0, 0)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def source_files(source: Path, output: Path, extras: list[str], include_env_template: bool) -> list[Path]:
    excluded = DEFAULT_EXCLUDED_PARTS | set(extras)
    result: list[Path] = []
    for path in source.rglob("*"):
        relative = path.relative_to(source)
        if path.is_symlink() or not path.is_file() or any(part in excluded for part in relative.parts):
            continue
        if path.suffix in {".pyc", ".zip"} or output == path or output in path.parents:
            continue
        if path.name.startswith(".env") and not (include_env_template and path.name in {".env.example", ".env.sample"}):
            continue
        result.append(path)
    return sorted(result)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path("."), help="Skill package directory")
    parser.add_argument("--output", type=Path, default=Path("dist"), help="Destination directory")
    parser.add_argument("--version", default="1.0.0")
    parser.add_argument("--exclude", action="append", default=[], help="Additional exact directory name to exclude")
    parser.add_argument("--include-env-template", action="store_true", help="Deliberately include .env.example or .env.sample")
    args = parser.parse_args()
    source, output = args.source.resolve(), args.output.resolve()
    if not (source / "SKILL.md").is_file():
        raise SystemExit(f"{source} does not look like a skill package (SKILL.md missing)")
    output.mkdir(parents=True, exist_ok=True)
    archive_stem = f"make-it-playable-v{args.version}"
    archive_root = "make-it-playable"
    archive = output / f"{archive_stem}.zip"
    manifest_path = output / f"{archive_stem}.manifest.json"
    checksum_path = output / f"{archive_stem}.sha256"
    files = source_files(source, output, args.exclude, args.include_env_template)
    manifest_files: list[dict[str, str | int]] = []
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zip_file:
        for path in files:
            relative = path.relative_to(source).as_posix()
            body = path.read_bytes()
            info = zipfile.ZipInfo(f"{archive_root}/{relative}", date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            zip_file.writestr(info, body, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
            manifest_files.append({"path": relative, "bytes": len(body), "sha256": sha256_bytes(body)})
    archive_hash = sha256_bytes(archive.read_bytes())
    manifest_path.write_text(json.dumps({"schemaVersion": 1, "archive": archive.name, "root": archive_root, "files": manifest_files, "archiveSha256": archive_hash}, indent=2) + "\n", encoding="utf-8")
    checksum_path.write_text(f"{archive_hash}  {archive.name}\n", encoding="utf-8")
    print(f"Created {archive} ({len(files)} files, {archive.stat().st_size:,} bytes)")
    print(f"Manifest {manifest_path}")
    print(f"Checksum {checksum_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
