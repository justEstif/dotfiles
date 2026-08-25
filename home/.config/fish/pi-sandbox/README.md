# pi-sandbox

Fish wrapper for running Pi in a least-privilege Docker container with isolated
state and a deny-by-default Bash command gate.

## Layout

- `Dockerfile` — pinned Pi runtime image
- `functions/pi-sandbox.fish` — wrapper entrypoint and option parsing
- `functions/__pi_sandbox_*.fish` — autoloaded help, path, image, state, and cleanup helpers
- `completions/pi-sandbox.fish` — command-line completions
- `../conf.d/pi-sandbox.fish` — adds both Fish directories to search paths
- `~/.pi/agent/extensions/pi-sandbox/` — exact-command allow/ask/deny gate

## Setup

Mise installs `docker-cli` on both platforms and Colima on macOS.

```fish
# macOS
colima start

# Linux, after bootstrap installs Docker Engine
sudo systemctl enable --now docker
```

The first non-dry run builds the pinned `pi-sandbox:0.84.3` image.

## Usage

```fish
pi-sandbox [sandbox options] -- [normal Pi arguments]
pi-sandbox --help
pi-sandbox -- --help
```

The container defaults to a read-only root and working tree, `--network none`,
an isolated tmpfs `/tmp`, no Linux capabilities, no-new-privileges, and
isolated temporary Pi state. Pi tools are disabled by default. If Bash is
enabled, every command is denied unless an exact simple command is granted
with `--allow-command` or `--ask-command`.

Selective host networking remains reserved until an allowlisting proxy is
added; `--allow-net` fails closed in the meantime.
