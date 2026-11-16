#!/usr/bin/env python3
"""GOODWAY public Chrome reader launch bridge, no scheduled task or API.

Opens a normal Chrome window (address bar retained for Chrome Translate).
Writes a short local JSONL route/status receipt without URLs, article text,
audio, credentials, person details or microphone transcripts.
Requires an explicit human invocation. Works without PowerShell policy changes.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
from datetime import datetime, timezone
from typing import Any

CONTRACT = "GOODWAY_CHROME_VOICE_BRIDGE_V1_20261116"
ROUTES: dict[str, str] = {
    "production": "https://drywrite.contents-os.com",
    "local-preview": "http://127.0.0.1:4173",
}
DEDUPE_SECONDS = 120


def chrome_executable(env: dict[str, str] | None = None) -> Path | None:
    values = env or os.environ
    bases = [
        values.get("PROGRAMFILES"),
        values.get("PROGRAMFILES(X86)"),
        values.get("LOCALAPPDATA"),
    ]
    for base in bases:
        if not base:
            continue
        location = Path(base) / "Google" / "Chrome" / "Application" / "chrome.exe"
        if location.is_file():
            return location
    return None


def log_path(env: dict[str, str] | None = None) -> Path:
    values = env or os.environ
    local = values.get("LOCALAPPDATA")
    if not local:
        raise RuntimeError("LOCAL_PRIVATE_DATA_FOLDER_NOT_FOUND")
    return Path(local) / "GOODWAY_WRITE" / "bridge_logs" / "chrome_voice_bridge.jsonl"


def recent_route_receipt(path: Path, route: str) -> bool:
    if not path.is_file():
        return False
    try:
        with path.open("r", encoding="utf-8-sig") as f:
            last = ""
            for line in f:
                if line.strip():
                    last = line
        item = json.loads(last)
        when = datetime.fromisoformat(str(item.get("atUtc", "")).replace("Z", "+00:00"))
        seconds = (datetime.now(timezone.utc) - when).total_seconds()
        return (item.get("contract") == CONTRACT and item.get("route") == route
                and item.get("status") == "CHROME_OPENED"
                and 0 <= seconds < DEDUPE_SECONDS)
    except (ValueError, TypeError, OSError, KeyError):
        return False


def safe_receipt(route: str) -> dict[str, Any]:
    return {
        "contract": CONTRACT,
        "node": "CHROME_PUBLIC_READER_LAUNCH",
        "route": route,  # a fixed enum, never a URL or query string
        "status": "CHROME_OPENED",
        "atUtc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sensitivePayloadSent": False,
        "modelRequest": False,
        "microphoneStarted": False,
        "newTriggerCreated": False,
    }


def launch(route: str, *, dry_run: bool = False) -> str:
    if route not in ROUTES:
        raise ValueError("UNSUPPORTED_CHROME_ROUTE")
    executable = chrome_executable()
    if executable is None:
        raise RuntimeError("CHROME_INSTALL_NOT_FOUND")
    log = log_path()
    if dry_run:
        return "CHROME_READY_DRY_RUN"
    if recent_route_receipt(log, route):
        return "GOODWAY_CHROME_RECENT_OPEN_SKIP"

    # Never use --app: removing the Chrome toolbar would hide native Translate.
    # Do not pass tokens, account IDs or unpublished text to command line.
    subprocess.Popen(
        [str(executable), "--new-window", ROUTES[route]],
        stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL, close_fds=True,
    )
    log.parent.mkdir(parents=True, exist_ok=True)
    with log.open("a", encoding="utf-8") as f:
        f.write(json.dumps(safe_receipt(route), ensure_ascii=False, separators=(",", ":")) + "\n")
    return "GOODWAY_CHROME_OPENED_ROUTE=" + route


def main() -> int:
    parser = argparse.ArgumentParser(description="Open existing GOODWAY WRITE in normal Chrome with local privacy-safe route log")
    parser.add_argument("--route", choices=tuple(ROUTES), default="production")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        print(launch(args.route, dry_run=args.dry_run))
        return 0
    except (OSError, RuntimeError, ValueError) as error:
        # Fixed reason codes only; never expose a path or the browser command.
        reason = str(error)
        known = {"UNSUPPORTED_CHROME_ROUTE", "CHROME_INSTALL_NOT_FOUND", "LOCAL_PRIVATE_DATA_FOLDER_NOT_FOUND"}
        print("GOODWAY_CHROME_HOLD=" + (reason if reason in known else "LOCAL_RUNTIME_ERROR"), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
