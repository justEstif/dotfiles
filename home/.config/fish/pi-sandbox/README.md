# pi-sandbox

Fish wrapper for running Pi with isolated state and explicit Mise filesystem,
network, and environment permissions.

## Layout

- `functions/pi-sandbox.fish` — wrapper implementation
- `completions/pi-sandbox.fish` — command-line completions
- `../conf.d/pi-sandbox.fish` — adds both directories to Fish's search paths
- `~/.pi/agent/extensions/pi-sandbox/` — fail-closed Bash sandbox extension

## Usage

```fish
pi-sandbox [sandbox options] -- [normal Pi arguments]
pi-sandbox --help
pi-sandbox -- --help
```

Pi tools are disabled by default. Enable only those required for a run with
Pi's native `--tools` argument after the separator.
