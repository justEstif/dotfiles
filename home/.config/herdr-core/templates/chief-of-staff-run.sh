#!/usr/bin/env bash
# Chief-of-staff launcher with auto worktree isolation.
# If another live pi agent already runs in this cwd, spawn into a fresh
# detached worktree so the two never share a working tree/branch.
set -u
CWD="$(pwd)"

others=$(hc ls 2>/dev/null | python3 -c '
import json, sys
try:
    ts = json.load(sys.stdin)["terminals"]
except Exception:
    sys.exit(0)
cwd = sys.argv[1]
n = sum(1 for t in ts if t.get("agent") == "pi" and t.get("state") == "live" and t.get("cwd") == cwd)
print(n)
' "$CWD" 2>/dev/null)

if [ "${others:-0}" -ge 1 ] && git rev-parse --git-dir >/dev/null 2>&1; then
    WT="$(dirname "$CWD")/.$(basename "$CWD")-wt-$(date +%s)"
    if git worktree add --detach "$WT" HEAD >/dev/null 2>&1; then
        echo "[chief-run] another pi is live in $CWD -> using worktree $WT"
        cd "$WT"
    else
        echo "[chief-run] WARNING: could not create worktree, sharing cwd (risk of clobbering)"
    fi
fi

exec pi --append-system-prompt /home/estifanos/.config/herdr-core/templates/chief-of-staff.md
