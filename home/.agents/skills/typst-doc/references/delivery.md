# Delivery — compile, share, and when to use a template

## Compile

```sh
typst compile doc.typ                 # → doc.pdf (default output)
typst compile doc.typ out.pdf         # explicit output path
typst compile doc.typ -f png          # PNG (first page)
typst compile doc.typ -f svg          # SVG
typst watch  doc.typ                  # recompile on save — use while iterating
typst compile doc.typ --root .        # set project root for absolute /imports
```

Use `typst watch` while building; run `typst compile` once for the final hand-off.

## Packages need network once

`@preview` packages are fetched from the Typst universe on first compile, then **cached locally** (`~/.cache/typst/packages` or the platform equivalent). After the first successful compile, the document builds offline. Implication: the **first** compile needs network; assume it unless the cache is pre-warmed.

## When to start from a universe template (not the preamble)

Use the pinned **preamble** for: status reports, specs, incident post-mortems, one-pagers, comparison matrices, diagrams, slide decks — anything composed from scratch.

Use a **universe template** when the document has an external format requirement (verify name + version on the universe first — same rule as packages):

- **Academic paper** → venue style: `charged-ieee`, `unequivocal-ams`, `bloated-neurips`, `lucky-icml`, `blind-cvpr`.
- **CV / résumé** → `brilliant-cv`, `basic-resume`, `clean-print-cv`.
- **Thesis** → search `<university> thesis` on the universe (hundreds exist).
- **Letter / invoice** → `letterloom`, `invoice-pro`.

Templates override the preamble — that is expected. They carry their own typography; don't fight them with the prose preamble.

## Sharing

- The **PDF is the artifact.** Hand it over directly.
- Include the `.typ` source only if the user may revise it.
- For a shareable link, the user can push the PDF anywhere — unlike HTML micro-apps, there is no runtime, so the viewer needs nothing but a PDF reader.

## Common compile errors

| Error | Cause | Fix |
|---|---|---|
| `package not found` / `failed to find @preview/.../typst.toml` | wrong name or version, or no network on first fetch | verify name+version on the universe; ensure network on first compile |
| `unknown variable` at a `#pkg.func(...)` call | `: *` does not bind a namespace; wrong imported symbol | import the specific symbols (`diagram`, `canvas`, …); verify on the universe page |
| `unknown variable` at a bare call | forgot the `#import` or wrong item | check the import line and exported items |
| `font not found, falling back to …` | referenced font not installed | run `typst fonts`; switch to a shipped font (`references/prose.md`) |
| error on a `#show` rule | show-rule scope or order | see `styling.md` for show-rule mechanics |

For any syntax error you cannot decode, see the syntax references — `syntax.md`, `styling.md`, `math.md`, `layout.md`.
