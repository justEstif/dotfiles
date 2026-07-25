#!/usr/bin/env python3
"""Quickly audit a repo for AI-agent feedback-loop guardrails."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT_MARKERS = ["package.json", "pyproject.toml", "Cargo.toml", "go.mod", "Gemfile"]
CI_PATTERNS = [".github/workflows", ".gitlab-ci.yml", "circle.yml", ".circleci", "azure-pipelines.yml"]
AGENT_DOCS = ["CLAUDE.md", "AGENTS.md", ".github/copilot-instructions.md", "CONTRIBUTING.md"]
ESLINT_FILES = ["eslint.config.js", "eslint.config.mjs", ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.cjs"]
PLAYWRIGHT_FILES = ["playwright.config.ts", "playwright.config.js", "playwright.config.mjs"]
OBS_FILES = ["sentry.client.config.ts", "sentry.server.config.ts", "sentry.properties", "datadog.yaml"]

def exists_any(root: Path, patterns: list[str]) -> list[str]:
    found = []
    for pattern in patterns:
        p = root / pattern
        if p.exists():
            found.append(pattern)
    return found

def read_text_if_exists(path: Path) -> str:
    try:
        return path.read_text(errors="ignore") if path.exists() and path.is_file() else ""
    except OSError:
        return ""

def package_scripts(root: Path) -> dict[str, str]:
    pkg = root / "package.json"
    if not pkg.exists():
        return {}
    try:
        return json.loads(pkg.read_text()).get("scripts", {})
    except Exception:
        return {}

def grep_configs(root: Path, names: list[str], needles: list[str]) -> dict[str, list[str]]:
    hits: dict[str, list[str]] = {}
    for name in names:
        text = read_text_if_exists(root / name)
        if text:
            matched = [n for n in needles if n in text]
            if matched:
                hits[name] = matched
    return hits

def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if not root.exists():
        print(f"Repo not found: {root}", file=sys.stderr)
        return 2

    scripts = package_scripts(root)
    ci = exists_any(root, CI_PATTERNS)
    agent_docs = exists_any(root, AGENT_DOCS)
    eslint = exists_any(root, ESLINT_FILES)
    playwright = exists_any(root, PLAYWRIGHT_FILES)
    obs = exists_any(root, OBS_FILES)
    strict_ts = "strict" in read_text_if_exists(root / "tsconfig.json")

    complexity_hits = grep_configs(root, ESLINT_FILES, [
        "complexity", "max-depth", "max-lines-per-function", "max-params",
        "max-statements", "cognitive-complexity", "sonarjs"
    ])
    architecture_hits = grep_configs(root, ESLINT_FILES, [
        "no-restricted-imports", "boundaries", "import/no-restricted-paths", "no-console"
    ])

    has_standard = bool(ci and (eslint or "lint" in scripts) and ("test" in scripts or exists_any(root, ["pytest.ini", "Cargo.toml", "go.mod"])))
    has_arch = bool(complexity_hits or architecture_hits)
    has_organism = bool(has_arch and (playwright or obs) and agent_docs)
    level = 3 if has_organism else 2 if has_arch else 1 if has_standard else 0

    print(f"Feedback loop audit: {root}")
    print(f"Level: {level} - " + ["Vibes", "Guardrails", "Architecture as Code", "The Organism"][level])
    print("\nDetected:")
    print(f"- CI: {', '.join(ci) if ci else 'missing'}")
    print(f"- Agent docs: {', '.join(agent_docs) if agent_docs else 'missing'}")
    print(f"- Package scripts: {', '.join(sorted(scripts)) if scripts else 'none detected'}")
    print(f"- ESLint/config: {', '.join(eslint) if eslint else 'missing'}")
    print(f"- TypeScript strict hint: {'present' if strict_ts else 'not detected'}")
    print(f"- Complexity rules: {complexity_hits if complexity_hits else 'not detected'}")
    print(f"- Architecture/import rules: {architecture_hits if architecture_hits else 'not detected'}")
    print(f"- Playwright: {', '.join(playwright) if playwright else 'missing'}")
    print(f"- Observability config: {', '.join(obs) if obs else 'not detected'}")

    print("\nSuggested next actions:")
    if not ci:
        print("1. Add CI that runs install, format/check, lint, typecheck, and tests.")
    if not eslint and (root / "package.json").exists():
        print("2. Add ESLint/Prettier and run lint with --max-warnings=0.")
    if not complexity_hits:
        print("3. Add complexity caps: complexity, max-depth, max-lines-per-function, max-params, max-statements, cognitive complexity.")
    if not architecture_hits:
        print("4. Convert one repeated review comment into no-restricted-imports or a custom lint rule.")
    if not playwright:
        print("5. Add e2e/screenshot tests for the three most critical flows.")
    if not agent_docs:
        print("6. Add/update agent docs with exact verification commands and architectural rules.")
    if level >= 2 and not obs:
        print("7. Wire actionable staging/production alerts into tracked tasks.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
