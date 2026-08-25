# pi-sandbox

Fish wrapper for running Pi with isolated state, explicit Mise filesystem and
environment permissions, and a deny-by-default Bash command gate.

## Layout

- `functions/pi-sandbox.fish` — wrapper entrypoint and option parsing
- `functions/__pi_sandbox_*.fish` — autoloaded help, path, state, and cleanup helpers
- `completions/pi-sandbox.fish` — command-line completions
- `../conf.d/pi-sandbox.fish` — adds both directories to Fish's search paths
- `~/.pi/agent/extensions/pi-sandbox/` — exact-command allow/ask/deny gate

## Usage

```fish
pi-sandbox [sandbox options] -- [normal Pi arguments]
pi-sandbox --help
pi-sandbox -- --help
```

Pi tools are disabled by default. Enable only those required for a run with
Pi's native `--tools` argument after the separator. If Bash is enabled, every
command is denied unless an exact simple command is granted with
`--allow-command` or `--ask-command`.
