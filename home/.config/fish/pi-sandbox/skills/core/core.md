# pi-sandbox core

pi-sandbox is a fish wrapper that runs Pi in a least-privilege Docker container: read-only root and working tree, `--network none` by default, no capabilities, no-new-privileges, isolated tmpfs `/tmp`, and temporary Pi state. Pi tools are disabled by default and every Bash command is denied unless explicitly granted.

## Network modes (pick exactly one)

1. Default: no network at all.
2. `--allow-net all` — unrestricted outbound (trusted local runs only).
3. Hostname-aware HTTPS CONNECT proxy (recommended for untrusted runs):

```fish
pi-sandbox --allow-net-host api.openai.com --allow-net-host '*.openai.com' \
  --deny-net-host telemetry.example.com -- ...
```

Proxy rules: exact hostnames and `*.domain` globs (apex excluded from globs); deny overrides allow; unknown hosts, direct-IP CONNECT, and non-443 ports are rejected. The proxy resolves DNS itself and only connects to public addresses, so DNS rebinding and private-network SSRF are blocked. Egress is only possible through an internal Docker network; the sandbox has no direct route.

## Credentials

- `--allow-env ZAI_API_KEY` — grant a provider env var (any code in the sandbox can read it)
- `--api-key ...` after `--` — pass through normal Pi arguments
- `--share-auth` — bind-mount host auth.json read/write (trusted-local only; don't mix with host login/logout)

## Bash command gate

With `-- --tools bash`, every command is deny-by-default:

```fish
pi-sandbox --allow-command 'git status*' --allow-command 'git diff*' \
  --ask-command 'git commit*' --deny-command 'git push*' -- --tools bash
```

Patterns use `*` as a greedy wildcard. Pipelines, chains, and substitutions are decomposed and every component must be allowed. Deny beats ask beats allow. Unparseable or hidden commands fail closed.

## Workflow

1. First non-dry run builds the pinned image (`pi-sandbox:0.84.3-permissions-27.0.1`) automatically.
2. Preview any run with `--dry-run`.
3. Keep state across runs with `--state-dir` (must not exist) or inspect a run with `--keep-state`.

## Full reference

Run `pi-sandbox --help` for the complete option list.
