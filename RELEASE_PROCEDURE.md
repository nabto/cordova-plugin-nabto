# Release Procedure

How to cut a release of `cordova-plugin-nabto`. This is for maintainers; for usage of the
plugin see [README.md](README.md).

## Versioning model

`package.json` is the **single source of truth** for the version. Everything else follows from
it:

- `plugin.xml`'s `<plugin version="...">` attribute (required by the
  [Cordova plugin spec](https://cordova.apache.org/docs/en/latest/plugin_ref/spec.html)) is
  kept in sync automatically by `scripts/sync-plugin-version.js`, which runs from the `version`
  lifecycle script in `package.json` whenever you run `npm version`.
- CI guards against drift: the `version-consistency` job in `.github/workflows/build.yml` fails
  any PR/push where `package.json` and `plugin.xml` disagree.
- The git tag is created **from** the bumped commit (via `npm version`), so the tag always
  matches the released version.

Versions follow [semver](https://semver.org/). Tags use a `v` prefix, e.g. `v3.0.1`.

## Prerequisites

- Push access to the `master` branch (or rights to merge a release PR and push the tag).
- **One-time npm Trusted Publisher setup** (CI *stages* the publish via OIDC — no tokens, no
  OTP). On [npmjs.com](https://www.npmjs.com/package/cordova-plugin-nabto) → the package →
  *Settings* → *Trusted Publisher*, add a GitHub Actions publisher (all fields case-sensitive):
  - Organization or user: `nabto`
  - Repository: `cordova-plugin-nabto`
  - Workflow filename: `release.yml`
  - Environment: *(leave blank)*
  - Allowed action: `npm stage publish` (staged publishing — a maintainer approves with 2FA
    before the version goes live)

  This is required once; without it the stage-publish step fails with an OIDC auth error.
- **npm CLI ≥ 11.15.0** locally for the approval step (`npm stage approve`), or just approve in
  the npmjs.com UI.

## Steps

### 1. Land the changes and update the changelog

Make sure everything for the release is merged to `master` and CI is green. Update
`CHANGELOG.md`: rename the `## X.Y.Z Unreleased` section to the new version with today's date,
and add a fresh empty `Unreleased` section above it (see the guide at the top of the changelog).

```
## 3.0.1 2026-06-15      <- renamed from "Unreleased"
...

## <next> Unreleased     <- new empty section
```

Commit this (it can be its own small PR, or part of the release work). `npm version` in the next
step requires a clean working tree.

### 2. Bump the version and tag

From an up-to-date, clean `master`:

```sh
npm version <new-version>      # e.g. npm version 3.0.1   (no leading v)
```

This single command:
- updates `version` in `package.json`,
- runs `scripts/sync-plugin-version.js` to update `plugin.xml` to the same version,
- creates a commit and an annotated tag `v<new-version>`.

For a pre-release use the rc convention, e.g. `npm version 3.1.0-rc1`.

### 3. Push

```sh
git push --follow-tags
```

This pushes both the version commit and the `v<new-version>` tag. **Pushing the `v…` tag is what
triggers the release** — `.github/workflows/release.yml` runs on any pushed tag matching `v*` and
**stages** the npm publish (see below). No GitHub Release is involved. The version is not live yet
— proceed to step 4.

### 4. Approve the staged publish (2FA)

CI stages the version to npm but cannot make it live (OIDC tokens can't approve). A maintainer
approves it with 2FA — either in the npmjs.com UI (package → **Staged Packages** → **Approve**),
or via the CLI:

```sh
npm stage list cordova-plugin-nabto      # find the <stage-id>
npm stage view <stage-id>                # (optional) inspect it
npm stage approve <stage-id>             # prompts for 2FA -> goes live
```

The version is staged under npm's default `latest` dist-tag, applied when you approve. If a
release needs a different dist-tag (e.g. an `rc` for a pre-release), stage it manually with
`npm stage publish --tag <tag>` instead of relying on the tag-push workflow.

### 5. Verify

After approval, confirm `cordova-plugin-nabto@<new-version>` is on npm (with a provenance badge),
under the expected dist-tag: `npm view cordova-plugin-nabto`.

## What CI does automatically

- **`.github/workflows/build.yml`** (every PR and push to `master`): checks
  `package.json`/`plugin.xml` version consistency, packs the plugin, and builds it into a
  throwaway Cordova app on Android and iOS.
- **`.github/workflows/release.yml`** (on push of a `v*` tag):
  1. verifies the tag matches `package.json`;
  2. **stages** the publish to npm via **OIDC trusted publishing** (`npm stage publish`, no
     tokens/OTP, provenance included) under the default `latest` dist-tag — the version is NOT
     live until approved (step 4).

## Summary

```sh
# 1. update CHANGELOG.md, commit
# 2. bump + tag
npm version 3.0.1
# 3. push commit + tag (pushing the v3.0.1 tag triggers CI, which STAGES the npm publish)
git push --follow-tags
# 4. approve the staged publish with 2FA (or use the npmjs.com Staged Packages tab)
npm stage list cordova-plugin-nabto
npm stage approve <stage-id>
# 5. verify
npm view cordova-plugin-nabto@3.0.1
```
