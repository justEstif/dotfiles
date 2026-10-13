---
source: https://github.com/cursor/plugins/tree/main/pstack/skills/poteto-mode
license: MIT (pstack, by poteto)
---

### Program plan (multi-phase or multi-PR)

**You own the plan, not the code. The plan is a checklist an owner runs box by box and the operator audits from the evidence.** The plan is the deliverable. Do not implement.

1. When the change is one or two files with an obvious approach, skip the plan. Say so and stop.
2. Settle open questions by prototype before you write. Run [prototype.md](../../task/playbooks/prototype.md) for each. Keep the branch, the SHA, and the screenshots for Appendix A. Ask the operator only about a product or preference call that no run can settle. Give options ([never-block-on-the-human](../../clarifier/references/never-block-on-the-human.md)).
3. Explore in subagents or fresh inline passes ([guard-the-context-window](../../task/references/principles/guard-the-context-window.md)). Each returns file pointers, conventions, test commands, and entry points. No inlined dumps.
4. Copy the skeleton below into the plan file and fill every placeholder. Unless the operator names a path, write the file under `$HOME/.pi/agent/pi-work/` using the shared naming contract. Keep every heading and every sub-block in the order shown. One section per PR. One PR is one change with its own evidence ([sequence-verifiable-units](sequence-verifiable-units.md)). Name the execution route in **How to read this**: Stage 3 of the `task` skill with the matching playbook per PR, or [figure-it-out](../../task/references/figure-it-out.md) for a bespoke run.
5. Write per [technical-writing](../../writer/references/technical-writing.md) in full, then [unslop](../../writer/references/unslop.md). The body is one Diátaxis mode, how-to. Appendices hold explanation and reference. Each heading states the task or the finding. No long dashes. No mid-sentence colons.
6. Validate the plan's references before handing it back: every skill, playbook, and file path the plan names must exist (run `node ~/.agents/scripts/check-skill-links.mjs` and `node ~/.agents/skills/task/scripts/stages.mjs` for skill references; check repo-local paths directly). Fix every dangling name ([encode-lessons-in-structure](../../capturer/references/encode-lessons-in-structure.md)).
7. Hand back. Post the plan path, then stop. Execution starts on the operator's explicit go, under the execution route the plan names.

**Verification.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked ([prove-it-works](../../tester/references/prove-it-works.md)). That sentence is the verification rule. Every verification block opens with it. The live block is mandatory. Lanes at the PR head drive the real surface (agent-browser for browser and web UIs; run the CLI directly), per [swarm](../../task/references/dispatch/swarm.md). Each lane is one box with a concrete scenario, the screenshot it saves, and its pass predicate. One lane is the **Regression lane against trunk.** It runs the same load-bearing scenario on trunk and head. If trunk does not have the feature, the lane records that fact and gates the behavior the diff adds plus the end state the user waits for instead of inventing a trunk result. The perf gate is dual-sided. Trunk and head must both produce the named metric. If trunk lacks the feature, also isolate the work the diff adds and set an absolute budget for that work plus the end-to-end state the user waits for. Do not claim a ratio between unlike scenarios. The perf block names the metric, the interleaved probe, the trunk baseline measured first, and the rule with the number that fails. A PR that changes an interaction is review-gated. The operator reviews it in chat with screenshots and a video before merge. A PR that changes no interaction writes `**Review gate.** None. <PR id> is not review-gated.` and no boxes under it.

**Driving the surface.** Browser and web UIs drive through [agent-browser](../../agent-browser/SKILL.md). CLIs and TUIs run directly. A PR that touches two surfaces gets lanes on both. A surface neither can drive is a risk in Appendix C, and its live block still names how each lane drives it.

````markdown
# <Program> plan

<Under ten lines. What changes, for whom, the rule the program enforces, and the PR ids in order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs <the execution route: task Stage 3 with the matching playbook per PR, or figure-it-out>. <Who merges, and which PR ids are the operator's items that stop at merge-ready.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] Read these from disk at program start. Re-read them at every tick.
  - [ ] `~/.agents/skills/task/SKILL.md`
  - [ ] `~/.agents/skills/task/references/dispatch/swarm.md`
  - [ ] <the agent-browser reference or direct-run recipe each lane uses>
  - [ ] `~/.agents/skills/publisher/references/opening-a-pr.md`
  - [ ] <each other skill reference the program uses, by on-disk path>
- [ ] On the operator's go, arm a recurring audit tick, about hourly or per completed PR, whichever comes first. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from disk. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Run owners

- [ ] Dispatch one owner per PR (a subagent per PR when parallel; otherwise a fresh pass per PR) with the full lifecycle the execution route names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the route stacks.
  - [ ] <PR id> and <PR id> are independent and first. Both branch from `main`.
  - [ ] <PR id> after <PR id>.
- [ ] Hold the file boundaries. <PR id or class> touches only `<glob>`.
- [ ] Hold the review gate. <PR ids> change an interaction. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] GitHub CLI (`gh`) for every PR operation. Never require another forge CLI.
- [ ] Open the PR ready, never draft, per `publisher`'s opening-a-pr, via `gh pr create --base <base-branch>`. A stack child targets its parent branch; manage stacks with gh-stack.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run [unslop](../../writer/references/unslop.md) before each commit and [comments](../../simplifier/references/comments.md) before review.
- [ ] Commit in scoped format (`<scope>: <description>`), per [git-workflow](../../git-workflow/SKILL.md).
- [ ] Rebase onto current trunk before the code-ready report. Keep that merge base in fix rounds. Rebase again only at merge prep, on a `git merge-tree` conflict with trunk, or on a CI failure that comes from a change on trunk.

### Verdict and merge, for every PR

- [ ] At the code-ready head SHA and at each later push that changes the patch, run the swarm per `~/.agents/skills/task/references/dispatch/swarm.md`. One gates lane. The live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts in the merge-ready report before the verdict.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new head gets a fresh swarm and a fresh verdict, except for results that stay valid under the patch-id rule in `~/.agents/skills/publisher/references/shipping.md`.
- [ ] <The merge or stack rule from the execution route: the owner merges its own PR via gh and git-workflow, or the root stacks it with gh-stack and the operator lands it bottom-up, with the patch-id rule from shipping.md.>

### Boot recipe, for every live lane

Each live lane runs against the PR head in its own worktree or checkout. Drive through agent-browser, or run the surface directly.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] <Start the backend and the surface. Wait for ready.>
- [ ] <Deliver input only through agent-browser or a direct run. Name the read-only diagnostics.>
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## <Task as a verb phrase> (<PR id>)

**Depends on.** <PR id, or None.>

**Files.**

- [ ] Edit `<path>`.
- [ ] Create `<path>`.
- [ ] Delete `<path>`.

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact log line or screen state.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `<command>`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run <the same load-bearing scenario> at trunk and head. If trunk lacks the feature, record that and gate <the behavior the diff adds plus the end state the user waits for>. Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<slug>.png`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured at both trunk and head. If trunk lacks the feature, also name the diff-added work and the end-to-end state the user waits for.>
- [ ] Probe. <The command or procedure, run at trunk and at the head, interleaved. Both sides must produce the metric.>
- [ ] Baseline. Record the trunk <value> first.
- [ ] Rule. <Head against trunk, with the number that fails. If the scenarios differ, add absolute budgets for the diff-added work and the user-visible end state instead of an invalid ratio.>

**Review gate.** The operator reviews before merge.

- [ ] Copy lane <n> screenshots into `<media path>/<pr-id>-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the change. Save it as `<media path>/<pr-id>-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] <The owner merges its own PR per git-workflow, or the root stacks it with gh-stack and the operator lands it bottom-up.>

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution route names.

## Appendix A. Prototype evidence

<Each open question a prototype answered, with the branch, the SHA, and the artifact links. Each question that stays unproven.>

## Appendix B. Alternatives rejected

<Each approach weighed and why it lost.>

## Appendix C. Risks

<Each risk with the PR it lands in and what the owner watches.>

## Appendix D. Links and reading list

<Docs to read before editing. Which PRs get `~/.agents/skills/explainer/references/how.md` and `~/.agents/skills/reviewer/references/interrogate.md`. The trail per `~/.agents/skills/task/references/decision-log.md`.>
````

**Reply:** the plan path, the PR ids with their dependencies and the review-gated set, what the prototypes proved and what stays unproven.
