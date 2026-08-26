# pi-sandbox

Fish wrapper for running Pi in a least-privilege Docker container with isolated
state and a deny-by-default Bash command gate.

## Layout

- `Dockerfile` — pinned Pi runtime image
- `functions/pi-sandbox.fish` — wrapper entrypoint and option parsing
- `functions/__pi_sandbox_*.fish` — autoloaded help, path, image, state, and cleanup helpers
- `completions/pi-sandbox.fish` — command-line completions
- `../conf.d/pi-sandbox.fish` — adds both Fish directories to search paths
- `@gotgenes/pi-permission-system` — pinned structured Bash policy gate

## Setup

Mise installs `docker-cli` on both platforms and Colima on macOS.

```fish
# macOS
colima start

# Linux, after bootstrap installs Docker Engine
sudo systemctl enable --now docker
```

The first non-dry run builds the pinned Pi 0.84.3 image with
`@gotgenes/pi-permission-system` 27.0.1.

## Usage

```fish
pi-sandbox [sandbox options] -- [normal Pi arguments]
pi-sandbox --help
pi-sandbox -- --help
```

The container defaults to a read-only root and working tree, `--network none`,
an isolated tmpfs `/tmp`, no Linux capabilities, no-new-privileges, and
isolated temporary Pi state. Pi tools are disabled by default. If Bash is
enabled, every command is denied unless a pattern grants it with
`--allow-command` or requests approval with `--ask-command`. Explicit
`--deny-command` patterns take precedence over ask and allow patterns.

The pinned permission system parses pipelines, command chains, substitutions,
and common indirection wrappers, then evaluates each discovered command. Its
patterns use `*` as a greedy wildcard. Composition is permitted only when every
component is permitted; unparseable or hidden commands fail closed by asking.
In a run without approval UI, an `ask` decision remains blocked.

```fish
pi-sandbox \
  --allow-command 'git status*' \
  --allow-command 'git diff*' \
  --ask-command 'git commit*' \
  --deny-command 'git push*' \
  -- --tools bash
```

Rules are emitted broad-to-specific as deny-by-default, then allow, ask, and
deny, so the more restrictive wrapper options win when patterns overlap. No
Git or AWS operations are enabled unless the caller supplies patterns.

Selective host networking remains reserved until an allowlisting proxy is
added; `--allow-net` fails closed in the meantime.
