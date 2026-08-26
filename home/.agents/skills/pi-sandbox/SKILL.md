---
name: pi-sandbox
description: Run Pi in a least-privilege Docker sandbox on this machine — read-only filesystem, no network by default, deny-by-default bash gate, hostname-scoped egress proxy. Use when running untrusted code or prompts, isolating a Pi run from host credentials/state, or when asked for sandboxed/contained agent execution.
---

# pi-sandbox

Fish wrapper (`pi-sandbox`) that runs Pi in a hardened Docker container: read-only root and working tree, `--network none` by default, no capabilities, no-new-privileges, isolated tmpfs `/tmp`, temporary state, and all Pi tools disabled unless enabled. Bash (when enabled via `-- --tools bash`) is deny-by-default with `--allow-command`/`--ask-command`/`--deny-command` patterns.

The wrapper lives in the dotfiles at `~/.config/fish/pi-sandbox/`. The pinned image (`pi-sandbox:0.84.3-permissions-27.0.1`) is built automatically on first non-dry run.

## Start here

This file is a discovery stub. Before using pi-sandbox beyond a simple one-shot run, load the version-matched guide from the CLI:

```bash
fish -c 'pi-sandbox skills get core'        # network modes, credentials, bash gate
fish -c 'pi-sandbox skills get core --full'
fish -c 'pi-sandbox skills list'
```

## Quick usage

```fish
pi-sandbox --allow-env ZAI_API_KEY --allow-net all -- -p 'review this repo'

# hostname-scoped egress (recommended for untrusted runs)
pi-sandbox --allow-env ZAI_API_KEY --allow-net-host api.z.ai --allow-net-host '*.z.ai' -- -p 'say ok'

# sandboxed bash with explicit grants
pi-sandbox --allow-command 'git status*' --allow-command 'git diff*' -- --tools bash
```

## Pitfalls

- Arguments after `--` go to Pi unchanged; sandbox options must come before it.
- `--share-auth` bind-mounts host auth.json read/write — trusted local runs only; don't mix with host login/logout.
- No docker group access from an agent shell on a fresh login — run through the user's terminal if docker fails with permission denied.
- `--allow-net-host` allows HTTPS CONNECT on 443 only; unknown hosts and direct IPs fail closed.
