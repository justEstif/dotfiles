# pi-sandbox

Fish wrapper for running Pi in a least-privilege Docker container with isolated
state and a deny-by-default Bash command gate.

## Layout

- `Dockerfile` — pinned Pi runtime image
- `functions/pi-sandbox.fish` — wrapper entrypoint and option parsing
- `functions/__pi_sandbox_*.fish` — autoloaded help, path, image, state, and cleanup helpers
- `proxy/hostname-connect-proxy.js` — hostname-aware HTTPS CONNECT egress proxy
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

1. Network is disabled by default. Either pass `--allow-net all` for
   unrestricted outbound access, or use `--allow-net-host` / `--deny-net-host`
   to enable a hostname-aware HTTPS CONNECT proxy mode on an internal Docker
   network with no direct internet route from the sandbox.
2. Credentials can be supplied through normal Pi arguments after `--`, such as
   `--api-key`, through a provider environment variable explicitly granted with
   `--allow-env`, or from existing host Pi login state with `--share-auth`.

```fish
pi-sandbox --share-auth --allow-net all -- \
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

`--allow-net all` enables unrestricted outbound connectivity, including access
to internet, LAN, and potentially host services. Use it only for trusted local
runs.

```fish
pi-sandbox \
  --allow-net-host api.openai.com \
  --allow-net-host '*.openai.com' \
  --deny-net-host telemetry.example.com \
  -- --provider openai-codex -p 'Review this repo'
```

Host-rule mode allows HTTPS CONNECT only. Policies match exact hostnames and
constrained `*.` subdomain globs; deny rules override allow rules. Unknown
hosts fail closed, direct-IP CONNECT is denied, and direct egress is blocked by
the sandbox's internal-only network attachment. CONNECT policy applies to
hostname and port (default 443) only; encrypted URL paths and request bodies
remain opaque without TLS interception.
