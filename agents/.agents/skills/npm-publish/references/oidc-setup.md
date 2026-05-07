# OIDC Trusted Publishing Reference

## Prerequisites

- Package must already exist on npm (first publish requires a traditional token or `npm login`)
- Node 24 on the runner (ships with npm 11.x — required for OIDC support)
- Cloud-hosted runners only (self-hosted not supported yet)
- `id-token: write` permission in workflow

## Human Steps (one-time per package)

These steps require a human — the agent cannot do them:

1. **First publish**: `npm login` + `npm publish` locally (or via temp token in CI)
2. **npmjs.com → Package Settings → Trusted Publisher → Add GitHub Actions**:
   - Owner (org/user) — case-sensitive
   - Repository name — without owner prefix
   - Workflow filename — e.g., `publish.yml` — case-sensitive, must match exactly
   - Environment — leave blank unless you set `environment:` in the workflow job
3. **Delete the temporary token** used for first publish

## Minimal OIDC Workflow

```yaml
name: publish
on:
  push:
    tags:
      - 'v*'
  release:
    types: [published]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write       # required for OIDC token generation
    # DO NOT set environment: here unless you configure the exact same
    # environment name in the trusted publisher settings on npmjs.com
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24  # npm 11 ships with Node 24; npm 10 (Node 22) has no OIDC support
          # DO NOT set registry-url — it injects GITHUB_TOKEN as NODE_AUTH_TOKEN,
          # which npm uses instead of performing the OIDC exchange
      - run: npm ci
      - run: npm publish --provenance --access public
```

Key points:

- No `NODE_AUTH_TOKEN` or `NPM_TOKEN` secret needed
- `--provenance` is required — do not omit it
- `--access public` required for scoped packages (`@scope/pkg`)
- `registry-url` must be absent — its presence is the single most common cause of OIDC 404

## What Actually Happens During OIDC Publish

1. npm 11 detects `ACTIONS_ID_TOKEN_REQUEST_URL` in the environment
2. npm requests a short-lived OIDC token from GitHub's token endpoint
3. npm sends that token to `registry.npmjs.org` for exchange
4. npmjs validates the token claims (owner, repo, workflow, optionally environment) against the trusted publisher config
5. npmjs returns a short-lived publish token scoped to this run
6. npm publishes using that token — no stored secret at any point

If step 4 fails, npm returns 404. If step 1-3 never happen (npm 10, or `NODE_AUTH_TOKEN` set), npm returns ENEEDAUTH.

## Common OIDC Errors

| Error | Cause | Fix |
| --- | --- | --- |
| `E404 Not Found - PUT registry.npmjs.org/@scope%2fpkg` | OIDC exchange failed — token claims don't match trusted publisher config | Check owner/repo/workflow name are exact; check environment field matches (or both are blank) |
| `E404` with `registry-url` set | `actions/setup-node` injected `GITHUB_TOKEN` as `NODE_AUTH_TOKEN`; npm used it instead of OIDC | Remove `registry-url` from `actions/setup-node` |
| `ENEEDAUTH` | npm CLI is too old (npm 10, Node 22) — no OIDC support | Switch to `node-version: 24` |
| `MODULE_NOT_FOUND: promise-retry` | `npm install -g npm@latest` crashed on npm 10 | Don't self-upgrade — switch to `node-version: 24` instead |
| `E404` with `environment:` set | Workflow `environment: npm` adds an environment claim to the OIDC token; trusted publisher has no environment configured | Either remove `environment:` from workflow, or add the environment name to the trusted publisher on npmjs.com |
| Works locally, fails in CI | OIDC only works in CI with `id-token: write` | Local publish always needs `npm login` or a token |
| Self-hosted runner failure | OIDC not supported on self-hosted runners | Use a traditional token for self-hosted |

## Monorepo OIDC

Each package needs its own trusted publisher entry on npmjs.com. All can point to the same workflow file.

```yaml
- run: npx changeset publish   # changesets
- run: npx lerna publish from-git --yes   # lerna
- run: pnpm -r publish --access public    # pnpm
```

## Monitoring

After OIDC setup, npm sends "Successfully published" emails per package/version. These show **"via OIDC"** — if you see "via token", something in the workflow is still falling back to token auth.
