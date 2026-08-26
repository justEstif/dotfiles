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

Mise installs `docker-cli` on both platforms and Colima on macOS. A running
Docker daemon is required. Prefer rootless Docker; access to a conventional
Docker daemon is effectively root-equivalent and should be an explicit setup
choice.

```fish
# macOS (Colima runs the daemon in its Linux VM)
colima start

# Linux: prefer Docker's rootless mode. If using the system daemon installed
# by bootstrap instead, enable it explicitly:
sudo systemctl enable --now docker
```

Provider connectivity has two parts:

1. Network access must be granted through the planned provider allowlisting
   proxy. Until then, `--allow-net` fails closed and prompted model calls cannot
   leave the container.
2. Credentials can be supplied through normal Pi arguments after `--`, such as
   `--api-key`, through a provider environment variable explicitly granted with
   `--allow-env`, or from existing host Pi login state with `--share-auth`.

```fish
# Credential side of the setup; provider calls also require network support.
pi-sandbox --share-auth -- \
  --provider openai-codex -p 'Review this repo'
```

`--share-auth` bind-mounts the host `auth.json` read/write so Pi can use existing
logins and persist refreshed OAuth tokens. This intentionally gives Pi and any
code allowed to read that path access to host credentials. Use it only for the
local trusted-sandbox case; omit it for stronger credential isolation. Avoid
concurrent host and sandbox login/logout operations because their auth lock files
live in different directories.

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
