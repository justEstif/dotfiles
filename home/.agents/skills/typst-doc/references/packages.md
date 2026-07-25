# Package routing — Typst universe

One default per need. The universe has 800+ packages; these 8 cover the common artifact types. For anything else (institution thesis formats, conference papers, CVs, chemistry, linguistics), search typst.app/universe — don't memorize the long tail.

## The verify-before-import rule (non-negotiable)

Typst packages import as `#import "@preview/<name>:<version>": <items>`. Three things must be real, or compile fails after the whole document is written:

1. **Name** — copy it from typst.app/universe/package/<name>.
2. **Version** — copy the *current* version from that page. Versions drift; a version that compiled last month may no longer be latest.
3. **Imported items** — `: *` imports a package's exports, **not a namespace**. Each package decides what it exports:

> Real failure (verified): `#import "@preview/fletcher:0.5.8": *` does **not** let you call `#fletcher.diagram(...)`. It exports `diagram`, `node`, `edge` directly. Same with `cetz` — it exports `canvas`, `draw`, not a `cetz.` namespace. The `pkg.func()` mental model is wrong more often than not.

If a package version won't compile, it may require a newer Typst than installed — try the previous version, or check the package's stated compatibility.

### Verified worked example — `cetz` (drawing canvas)

```typst
#import "@preview/cetz:0.5.2": canvas, draw

#canvas({
  import draw: *
  line((0, 0), (3, 3))
})
```

### Verified worked example — `fletcher` (nodes + arrows)

```typst
#import "@preview/fletcher:0.5.8": diagram, node, edge

#diagram(
  node((0, 0), [A]),
  node((1, 0), [B]),
  edge((0, 0), (1, 0)),
)
```

Both compile cleanly on typst 0.14.2. Use them as the shape for any `@preview` import: **import the specific symbols, then call them bare.**

## The core set (versions verified to resolve on typst 0.14.2)

| Need | Package | Current version (re-verify) |
|---|---|---|
| Drawing canvas | `cetz` | `0.5.2` |
| Nodes + arrows / flowcharts | `fletcher` | `0.5.8` |
| Gantt / timeline | `timeliney` | `0.4.0` |
| Slides | `touying` | `0.7.4` |
| Code blocks | `codly` | `1.3.0` |
| Callouts / admonitions | `gentle-clues` | `1.3.1` |
| Icons | `iconify` | `0.5.3` |
| Running headers | `hydra` | `0.6.3` |

For `timeliney`, `touying`, `codly`, `gentle-clues`, `iconify`, `hydra`: the versions above resolve and accept `: *`, but each has its own entry function / theme API. **Verify the call signature on the package's universe page before writing the body** — same rule as `cetz`/`fletcher`.

## Tables — built-in, no package

Typst's `#table()` is capable on its own. A polished default to pair with the preamble:

```typst
#set table(stroke: none, align: left + horizon, inset: 8pt)
#show table.cell.where(y: 0): strong
#show table.cell.where(y: 0): set text(fill: accent)
```

`booktabs` exists (0.0.4, early) — only reach for it if you specifically want LaTeX booktabs rules.
