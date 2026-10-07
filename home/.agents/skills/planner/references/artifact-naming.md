# Task artifacts

`$HOME/.pi/agent/pi-work/` is local, untracked runtime storage for plans and captured lessons. It must live outside the dotfiles repository: do not commit, symlink into dotfiles, or provision its contents through dotfile tracking. Create it on demand. This tracked skill reference owns the naming contract; runtime storage needs no `AGENTS.md` or templates.

## Naming contract

- Files: `<repo-or-folder>--YYYY-MM-DD--<task>--plan.md` and the matching `--learned.md`.
- In Git, identify the repository from `git rev-parse --git-common-dir`, resolving relative paths against the checkout. For a conventional `.git` directory use its parent folder name; for a bare repository use the bare root name (without `.git`). Linked worktrees share this common identity. Do not use the branch or linked worktree folder name. For an unusual layout where this cannot identify the repository, ask once rather than guess.
- Outside Git, use the current working folder's basename.
- Normalize repo/folder and task names to lowercase hyphenated slugs; preserve enough of the task name to distinguish it. If an unrelated task collides, suffix its task slug with `-2`, `-3`, etc.; never overwrite it.
- Choose the local date when first saving the plan. Retain that prefix across later days, revisions, worktrees, and captures. For capture without a plan, choose the date and task slug once when first creating the lesson file.

## Routing

- For intended work and its confirmed brief, open the matching `--plan.md`.
- For reusable insights from that work, open the matching `--learned.md`.
- Paired artifacts link to each other using relative Markdown links when both exist; do not duplicate the brief or lesson content.
- Templates and behavior stay in the `planner` and `capturer` skills' `assets/` and `SKILL.md` files. Read only the artifacts relevant to the task.
- Existing `pi-plans/` and `pi-learned/` files are historical artifacts; do not migrate or delete them automatically.
