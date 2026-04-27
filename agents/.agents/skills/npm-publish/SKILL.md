---
name: npm-publish
description: "Publish npm packages with OIDC trusted publishing, GitHub release workflows, and version synchronization. Use when setting up npm publish CI/CD, configuring OIDC/trusted publishers, fixing version sync issues (package.json vs git tag), troubleshooting npm publish 403/errors, creating release workflows, or publishing scoped/monorepo packages. Triggers: npm publish, npm release, OIDC, trusted publisher, package.json version, npm 403, publish workflow, changesets publish, lerna publish."
---

# npm Publish

Guardrails for publishing npm packages — OIDC setup, version sync, release workflows, and common failure modes.

## Before Publishing, Ask

- **Has this package been published before?** First publish requires a traditional token or `npm login`. OIDC can only be configured after the package exists on npm.
- **Is the version in package.json the one you intend to publish?** Check against `npm view <pkg> versions --json` and the current git tag. They must all agree.
- **Are you shipping built artifacts?** Verify `files` in package.json points to the right directory and the build step runs before publish.

## OIDC Trusted Publishing

**MANDATORY — READ `references/oidc-setup.md`** when setting up or troubleshooting OIDC workflows.

Key constraints:

- OIDC requires `id-token: write` permission and `registry-url` in `actions/setup-node`
- No `NPM_TOKEN` secret needed — remove it
- Workflow filename on npmjs.com settings must match exactly (case-sensitive, including `.yml`)
- **First publish cannot use OIDC** — package must exist on npm first
- The "Require OIDC" radio button on npmjs.com is critical and easy to miss

## Version Synchronization

The #1 source of publishing failures: `package.json` version ≠ git tag ≠ GitHub release version.

**MANDATORY — READ `references/pitfalls.md`** when troubleshooting publish failures.

The invariant: **one source of truth for version**. Pick one:

- **Git tag is truth**: Derive `package.json` version from `$GITHUB_REF_NAME` in CI (`npm version "$TAG_VERSION" --no-git-tag-version`)
- **package.json is truth**: Use `npm version <patch|minor|major>` which updates package.json, commits, and tags atomically
- **Changesets/Lerna is truth**: Let the tool manage it — don't manually edit versions

Validate before publish:

```bash
PKG_VERSION=$(jq -r .version package.json)
TAG_VERSION="${GITHUB_REF_NAME#v}"  # strip leading 'v' from tag
[ "$PKG_VERSION" != "$TAG_VERSION" ] && echo "VERSION MISMATCH" && exit 1
```

## Pre-Publish Checklist

Run these before every publish attempt:

```bash
npm publish --dry-run     # See what will be shipped
npm pack && tar -tzf *.tgz  # Inspect tarball contents
```

## NEVER

- **NEVER publish without `--dry-run` first**
  **Instead:** Run `npm publish --dry-run` and inspect the output.
  **Why:** Catches wrong files field, missing build, accidental node_modules inclusion.

- **NEVER try to republish the same version**
  **Instead:** Always bump version. Check `npm view <pkg> versions`.
  **Why:** npm versions are immutable. Even after unpublish, the version is tainted for 24h, blocked after 72h.

- **NEVER trigger publish on push to main**
  **Instead:** Use `on: release: types: [published]` or `on: workflow_dispatch`.
  **Why:** Every push would publish. Accidental commits ship broken packages.

- **NEVER forget `--access public` for scoped packages**
  **Instead:** Always include `--access public` in the publish command or set it once with `npm config set access public`.
  **Why:** First publish of `@scope/pkg` defaults to restricted (private). Users can't install it.

- **NEVER store npm tokens long-term in CI secrets when OIDC is available**
  **Instead:** Configure OIDC trusted publishing.
  **Why:** Tokens are long-lived, can leak via logs or config, require manual rotation. OIDC uses short-lived, workflow-scoped credentials.

- **NEVER skip the build step in CI**
  **Instead:** Always run `npm run build` (or equivalent) before `npm publish`.
  **Why:** `npm publish` ships whatever is on disk. If `dist/` isn't built, you ship nothing.

- **NEVER edit `package.json` version and tag separately**
  **Instead:** Use `npm version <semver>` which updates package.json, creates commit, and tags atomically.
  **Why:** Manual edits create version/tag drift — the root cause of most publish failures.
