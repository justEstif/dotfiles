#!/usr/bin/env python3
"""Deterministically run pi subagents from a JSON plan file."""
from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

READ_ONLY_TOOLS = "read,grep,find,ls"


def load_frontmatter(path: Path) -> tuple[dict[str, Any], str]:
    text = path.read_text()
    if not text.startswith("---\n"):
        raise SystemExit(f"missing frontmatter: {path}")
    _, fm, body = text.split("---", 2)
    meta: dict[str, Any] = {}
    for line in fm.strip().splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, _, value = line.partition(":")
        if not _:
            continue
        raw = value.strip()
        if raw.lower() == "true":
            val: Any = True
        elif raw.lower() == "false":
            val = False
        elif raw.lower() in {"null", "none"}:
            val = None
        elif raw.isdigit():
            val = int(raw)
        else:
            val = raw.strip('"\'')
        meta[key.strip()] = val
    return meta, body.strip()


def slug(s: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_.-]+", "-", s).strip("-")[:80] or "agent"


def in_git_repo() -> bool:
    return subprocess.run(["git", "rev-parse", "--is-inside-work-tree"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0


def artifact_root(plan: dict[str, Any]) -> Path:
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    name = slug(plan.get("task", "subagents"))
    if in_git_repo():
        root = Path.cwd() / ".pi" / "subagents"
    else:
        root = Path.home() / ".pi" / "agent" / "subagents"
    return root / f"{stamp}-{name}"


def build_prompt(agent: dict[str, Any], shared_context: str, ref_meta: dict[str, Any], ref_body: str, dependency_outputs: dict[str, str]) -> str:
    dep = "\n\n".join(f"### {k}\n{v}" for k, v in dependency_outputs.items())
    return f"""{ref_body}

## Current subagent task
{agent['task']}

## Curated shared context
{shared_context or '(none)'}

## Dependency outputs
{dep or '(none)'}

## Execution constraints
- Agent type: {ref_meta.get('name')}
- Writes allowed: {str(ref_meta.get('writes', False)).lower()}
- Return only your final artifact; do not include hidden reasoning.
""".strip() + "\n"


def command_for(agent: dict[str, Any], meta: dict[str, Any], prompt: str) -> list[str]:
    cmd = ["pi", "--no-session", "-p"]
    model = agent.get("model") or meta.get("model")
    if model and model != "inherit":
        cmd[1:1] = ["--model", str(model)]
    tools = agent.get("tools") or meta.get("tools")
    writes = bool(meta.get("writes", False))
    if not writes:
        cmd[1:1] = ["--tools", READ_ONLY_TOOLS]
    elif tools:
        cmd[1:1] = ["--tools", str(tools)]
    cmd.append(prompt)
    return cmd


def run_one(agent: dict[str, Any], plan: dict[str, Any], refs: dict[str, tuple[dict[str, Any], str]], outdir: Path, completed: dict[str, str]) -> tuple[str, str]:
    aid = agent["id"]
    atype = agent["type"]
    if atype not in refs:
        raise RuntimeError(f"unknown agent type {atype!r} for {aid}")
    meta, body = refs[atype]
    deps = {d: completed[d] for d in agent.get("depends_on", [])}
    prompt = build_prompt(agent, plan.get("context", ""), meta, body, deps)
    (outdir / f"{aid}-prompt.md").write_text(prompt)
    cmd = command_for(agent, meta, prompt)
    result = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output = result.stdout
    if result.stderr:
        output += "\n\n## STDERR\n" + result.stderr
    if result.returncode != 0:
        output += f"\n\n## Exit code\n{result.returncode}\n"
    (outdir / f"{aid}-output.md").write_text(output)
    return aid, output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path)
    parser.add_argument("--refs", type=Path, default=Path(__file__).resolve().parents[1] / "references")
    args = parser.parse_args()

    plan = json.loads(args.plan.read_text())
    subagents = plan.get("subagents", [])
    if not subagents:
        raise SystemExit("plan has no subagents")

    refs: dict[str, tuple[dict[str, Any], str]] = {}
    for p in args.refs.glob("*-agent.md"):
        meta, body = load_frontmatter(p)
        name = str(meta.get("name", p.stem))
        refs[name.removesuffix("-agent")] = (meta, body)
        refs[name] = (meta, body)

    outdir = artifact_root(plan)
    outdir.mkdir(parents=True, exist_ok=False)
    (outdir / "plan.json").write_text(json.dumps(plan, indent=2) + "\n")

    manifest = [f"# Subagent run", "", f"Task: {plan.get('task', '')}", f"Created: {dt.datetime.now(dt.timezone.utc).isoformat()}", "", "## Agents"]
    for a in subagents:
        manifest.append(f"- {a['id']} ({a['type']}), depends_on={a.get('depends_on', [])}")
    (outdir / "manifest.md").write_text("\n".join(manifest) + "\n")

    remaining = {a["id"]: a for a in subagents}
    completed: dict[str, str] = {}
    while remaining:
        ready = [a for a in remaining.values() if all(d in completed for d in a.get("depends_on", []))]
        if not ready:
            raise SystemExit(f"dependency cycle or missing dependency: {sorted(remaining)}")
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(ready)) as ex:
            futs = [ex.submit(run_one, a, plan, refs, outdir, completed) for a in ready]
            for fut in concurrent.futures.as_completed(futs):
                aid, output = fut.result()
                completed[aid] = output
                remaining.pop(aid)

    summary = ["# Subagent outputs", "", f"Artifact directory: `{outdir}`", ""]
    for aid, output in completed.items():
        summary.append(f"## {aid}\n\n{output.strip()}\n")
    (outdir / "summary.md").write_text("\n".join(summary))
    print(outdir)
    print((outdir / "summary.md").read_text())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
