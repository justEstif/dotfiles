# Pi Config Notes

## Symlinked Example Extensions

Extensions are symlinked from the mise-installed pi package using the `latest` pointer to survive upgrades:

```
~/.local/share/mise/installs/npm-earendil-works-pi-coding-agent/latest/lib/node_modules/@earendil-works/pi-coding-agent/examples/extensions/
```

Using `latest` (not a pinned version like `0.75.5`) ensures symlinks don't break when pi is upgraded — mise updates the `latest` symlink automatically.

### Currently symlinked

- `extensions/todo.ts` — todo extension (single file)
- `extensions/subagent/` — subagent extension (directory with `index.ts` + `agents.ts`)
- `agents/` — subagent agent definitions (planner, reviewer, scout, worker)
- `prompts/` — subagent workflow prompts (implement, implement-and-review, scout-and-plan)

### Cross-platform (macOS)

These symlinks work on macOS too, as long as mise uses the same default data dir (`~/.local/share/mise/`). Verify with:

```bash
mise where npm-earendil-works-pi-coding-agent@latest
```
