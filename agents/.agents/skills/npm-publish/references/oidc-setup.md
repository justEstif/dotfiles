# OIDC Trusted Publishing Reference

## Prerequisites

- Package must already exist on npm (first publish requires a traditional token or `npm login`)
- npm CLI 11.5+ for full OIDC support
- Cloud-hosted runners only (self-hosted not supported yet)
- `id-token: write` permission in workflow

## Human Steps (one-time per package)

These steps require a human — the agent cannot do them:

1. **First publish**: `npm login` + `npm publish` locally (or via temp token in CI)
2. **npmjs.com → Package Settings → Trusted Publisher → Add GitHub Actions**:
   - Owner (org/user) — case-sensitive
   - Repository name — without owner prefix
   - Workflow filename — e.g., `publish.yml` — case-sensitive, must match exactly
   - Environment — optional, but if set must match workflow
3. **Toggle "Require OIDC"** — this is a small radio button, easy to miss. Without it, token-based publishing still works (security gap).
4. **Delete the temporary token** used for first publish

### The 2FA gauntlet

Each package requires ~6 two-factor authentication codes:

1. Create token → 2FA code
2. First publish → 2FA code
3. Navigate to settings → 2FA code
4. Add trusted publisher → 2FA code
5. Toggle "Require OIDC" → 2FA code
6. Delete temp token → 2FA code

For monorepos: repeat per package.

## Minimal OIDC Workflow

```yaml
name: Publish to npm
on:
  release:
    types: [published]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write # Required for OIDC
    environment: npm # Must match npm trusted publisher config (if set)
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm publish --provenance --access public
```

Key points:

- No `NODE_AUTH_TOKEN` or `NPM_TOKEN` secret needed
- `--provenance` is automatic with OIDC but explicit is clearer
- `--access public` needed for scoped packages on first publish
- `registry-url` in setup-node sets `NODE_AUTH_URL` automatically
- The environment name, if configured on npm, must match exactly

## Monorepo OIDC

Each package in a monorepo needs its own trusted publisher entry on npmjs.com. They can all point to the same workflow file.

### With Changesets

```yaml
- run: npx changeset publish
```

### With Lerna

```yaml
- run: npx lerna publish from-git --yes
```

### With pnpm

```yaml
- run: pnpm -r publish --access public
```

## Common OIDC Errors

| Error                      | Cause                                          | Fix                                                                               |
| -------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------- |
| "Unable to authenticate"   | Workflow filename mismatch with npm config     | Verify exact filename including `.yml`, case-sensitive                            |
| "Unable to authenticate"   | Missing `id-token: write` permission           | Add to workflow `permissions`                                                     |
| "Unable to authenticate"   | npm CLI too old                                | Ensure npm 11.5+                                                                  |
| "Repository URL mismatch"  | Missing/wrong `repository.url` in package.json | Add `{"repository": {"type": "git", "url": "https://github.com/owner/repo.git"}}` |
| Works locally, fails in CI | OIDC only works in CI                          | Local publish always needs token/login                                            |
| Self-hosted runner failure | OIDC not supported on self-hosted              | Use traditional token for self-hosted                                             |

## Monitoring

After OIDC setup, npm sends "Successfully published" emails per package/version. These show **"via OIDC"** or **"via token"**. If you see "via token" on an OIDC-configured package, the "Require OIDC" toggle was missed.
