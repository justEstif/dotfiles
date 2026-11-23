#!/usr/bin/env bash
# Collision stress test v2: each chief gets its own worktree, so same-branch
# commit clobbering should be impossible. Lives outside the repo.
set -u
REPO="$HOME/Documents/projects/stress-web"
BASE=3caf75d
OUT=/tmp/stress-results2.md
WT_A="$HOME/Documents/projects/stress-wt-a"
WT_B="$HOME/Documents/projects/stress-wt-b"
: > "$OUT"
cd "$REPO"

kill_live() {
  for t in $(hc ls 2>/dev/null | python3 -c 'import json,sys
print(" ".join(t["address"] for t in json.load(sys.stdin)["terminals"] if t["state"]=="live" and t.get("agent")=="pi"))'); do
    hc kill "$t" >/dev/null 2>&1; hc rm "$t" >/dev/null 2>&1
  done
  sleep 1
}

cleanup_worktrees() {
  kill_live
  git worktree remove --force "$WT_A" >/dev/null 2>&1
  git worktree remove --force "$WT_B" >/dev/null 2>&1
  git worktree prune
}

run_round() {
  local n=$1 a="$2" b="$3"
  cleanup_worktrees
  git reset -q --hard "$BASE"; git clean -qfd
  git worktree add --detach "$WT_A" "$BASE" >/dev/null 2>&1 || { echo "## Round $n\n- WORKTREE-A FAILED" >> "$OUT"; return; }
  git worktree add --detach "$WT_B" "$BASE" >/dev/null 2>&1 || { echo "## Round $n\n- WORKTREE-B FAILED" >> "$OUT"; return; }
  echo "## Round $n" >> "$OUT"
  local ok=0
  hc run --bg --name chief-a --cwd "$WT_A" chief-of-staff-wt "Task: $a Report results with hc send \$HC_TERMINAL_ID when done or stuck." >/dev/null 2>&1 && ok=1
  hc run --bg --name chief-b --cwd "$WT_B" chief-of-staff-wt "Task: $b Report results with hc send \$HC_TERMINAL_ID when done or stuck." >/dev/null 2>&1 && ok=$((ok+1))
  [ "$ok" -lt 2 ] && { echo "- LAUNCH FAILED ($ok/2)" >> "$OUT"; return; }
  hc wait chief-a >/dev/null 2>&1; hc wait chief-b >/dev/null 2>&1
  sleep 2
  echo "- wt-a: $(node "$WT_A/app-a/test.js" 2>&1 | tail -1) | wt-b: $(node "$WT_B/app-b/test.js" 2>&1 | tail -1)" >> "$OUT"
  echo "- wt-a full: $(node "$WT_A/app-a/test.js" >/dev/null 2>&1 && echo A1-pass || echo A1-fail) $(node "$WT_A/app-b/test.js" >/dev/null 2>&1 && echo A2-pass || echo A2-fail) commits:$(cd "$WT_A" && git log --oneline "$BASE"..HEAD | wc -l)" >> "$OUT"
  echo "- wt-b full: $(node "$WT_B/app-a/test.js" >/dev/null 2>&1 && echo B1-pass || echo B1-fail) $(node "$WT_B/app-b/test.js" >/dev/null 2>&1 && echo B2-pass || echo B2-fail) commits:$(cd "$WT_B" && git log --oneline "$BASE"..HEAD | wc -l)" >> "$OUT"
  echo "- wt-a log: $(cd "$WT_A" && git log --oneline "$BASE"..HEAD | tr '\n' ';')" >> "$OUT"
  echo "- wt-b log: $(cd "$WT_B" && git log --oneline "$BASE"..HEAD | tr '\n' ';')" >> "$OUT"
}

run_round 1 "In app-a/test.js the assertion fails - greet must return uppercase (HELLO WORLD). Make it pass. Root cause may be outside app-a." "In packages/shared/format.js make greet append an exclamation mark (hello world!). Do not touch app tests."
run_round 2 "Change greet to return 'Hello, NAME.' (capitalized, trailing period) and make app-a/test.js and app-b/test.js expect that." "Change greet to return NAME uppercased with a trailing '!!!' and make app-a/test.js and app-b/test.js expect that."
run_round 3 "Refactor packages/shared/format.js: keep greet behavior identical but extract string building into a private helper. No behavior change; tests must still pass as-is." "Edit packages/shared/format.js greet to shout (uppercase). Update app-a/test.js and app-b/test.js to expect shouting."
run_round 4 "Make app-a/server.js use farewell instead of greet. Do not change shared code unless required." "Rename farewell to sayBye everywhere (shared + all apps + tests)."
run_round 5 "Add app-a/greet-spec.js with a test asserting greet is a function and returns a string. Run it." "Rename greet to salute everywhere (shared + both apps) and update every test including any new test files you find."
run_round 6 "Convert packages/shared/format.js to ESM exports. Update both apps to import it. node app-a/test.js must pass." "Add a function shout(name) to packages/shared that returns the uppercase greeting, and use it in app-b/server.js."
run_round 7 "In app-a/server.js change the greeting call to greet('chief-a')." "In app-a/server.js change the greeting call to greet('chief-b')."
run_round 8 "Move packages/shared/format.js to packages/shared/lib.js and update all importers. Everything must still work." "Rewrite greet in packages/shared/format.js to prefix 'yo ' to the name before greeting."
run_round 9 "Change greet signature to greet(name, punctuation) defaulting to '!'. Update all call sites and tests." "Update app-a and app-b to pass '.' punctuation to greet and assert a trailing period in tests."
run_round 10 "Write README.md at repo root documenting greet and farewell usage with examples." "Refactor packages/shared/format.js internals for clarity; behavior and public API unchanged; tests must still pass."
cleanup_worktrees
echo "DRIVER-DONE"
cat "$OUT"
