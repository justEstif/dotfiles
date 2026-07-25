# Common Pitfalls Reference

## Version Sync Issues

### package.json version ≠ git tag

**Symptom**: Release workflow publishes wrong version or fails with "version already published".

**Root cause**: The `on: release` trigger fires when a GitHub release is created, but the git tag version and `package.json` version can diverge if:
- Someone edited `package.json` version without tagging
- Someone created a tag without updating `package.json`
- The release tag format doesn't match expectations (e.g., `v1.2.3` vs `1.2.3`)

**Fix patterns**:

1. **Let `npm version` do it all** (recommended for simple packages):
   ```bash
   npm version patch -m "chore: release v%s"
   git push --follow-tags
   ```
   This atomically updates `package.json`, commits, and creates a matching tag.

2. **Derive version from tag in CI** (for release-triggered workflows):
   ```bash
   # Extract version from tag, stripping leading 'v'
   TAG_VERSION="${GITHUB_REF_NAME#v}"
   # Update package.json to match
   npm version "$TAG_VERSION" --no-git-tag-version --allow-same-version
   ```

3. **Validate before publish**:
   ```bash
   # Fail if package.json version doesn't match the git tag
   PKG_VERSION=$(jq -r .version package.json)
   TAG_VERSION="${GITHUB_REF_NAME#v}"
   if [ "$PKG_VERSION" != "$TAG_VERSION" ]; then
     echo "ERROR: package.json ($PKG_VERSION) != git tag ($TAG_VERSION)"
     exit 1
   fi
   ```

### "You cannot publish over the previously published version"

**Cause**: Trying to publish a version that already exists on npm.

**Why it happens**: npm versions are immutable. Even if you unpublish, the version number is tainted for 24 hours (and fully blocked after 72 hours for security).

**Fix**: Always bump version. Never try to republish the same version.

```bash
# Check what's already published
npm view <package-name> versions --json
```

## Build Issues

### Publishing unbuilt source

**Symptom**: Users install your package and get `Cannot find module` or import errors.

**Root cause**: `npm publish` sends whatever is in the directory. If `files` in package.json points to `dist/` but the build step wasn't run or `dist/` wasn't committed, you ship empty or stale artifacts.

**Fix**: Always build in CI before publish:
```yaml
- run: npm ci
- run: npm run build
- run: npm publish
```

### Wrong `files` field

**Symptom**: Package is too large (includes tests, docs, src) or too small (missing dist).

**Check**:
```bash
# Dry run to see what will be included
npm publish --dry-run
# Inspect the tarball
npm pack && tar -tzf *.tgz
```

**Common mistake**: `files: ["src"]` when you meant `files: ["dist"]`. Or missing `files` entirely and publishing `node_modules`.

## Permission Issues

### 403 Forbidden

| Scenario | Cause | Fix |
|----------|-------|-----|
| First publish of a name | Name taken by someone else | Use scoped name: `@scope/package-name` |
| Publishing existing package | Wrong account / not a maintainer | Check `npm owner ls <pkg>` |
| Scoped package | Missing `--access public` | `npm publish --access public` |
| Organization package | Not in the org team | Org admin must add you |
| OIDC workflow | "Require OIDC" not toggled on npm | Toggle in package settings on npmjs.com |

### Dual-factor auth issues

If the npm account has 2FA enabled (recommended), `npm publish` from a terminal requires an OTP:
```bash
npm publish --otp=<code>
```

For CI, use an automation token or OIDC — neither requires interactive OTP.

## Release Workflow Anti-Patterns

### Triggering on push instead of release

**Bad**: Publishing on every push to main.
```yaml
on:
  push:
    branches: [main]
```

**Good**: Publishing on GitHub release creation.
```yaml
on:
  release:
    types: [published]
```

### Missing `--access public` for scoped packages

First publish of a scoped package defaults to restricted. Always include:
```bash
npm publish --access public
```

Subsequent publishes remember the access level, but explicit is safer.

### Not validating the package before publish

```bash
# Quick sanity check
npm publish --dry-run

# Full validation
npm pack
tar -tzf *.tgz | head -20  # Check contents
```

## Monorepo-Specific Pitfalls

### Tag collision

In a monorepo with multiple packages, `npm version patch` creates tags like `v1.2.3` — which package does it refer to?

**Fix**: Use package-prefixed tags:
```bash
# Instead of v1.2.3, use @scope/pkg-name@1.2.3
# Lerna and Changesets handle this automatically
```

### Partial publish failure

If a monorepo publish partially fails (3 of 5 packages published), you can't re-run it naively — the 3 already-published versions will 403.

**Fix**: Use idempotent tools (Changesets, Lerna) that skip already-published versions.
