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
- The git tag is created on the commit **on `master`** that contains the bump (after the release
  PR is merged), so the tag always matches the released version. The release workflow refuses to
  stage a tag whose version differs from `package.json`.

Versions follow [semver](https://semver.org/). Tags use a `v` prefix, e.g. `v3.0.1`.

## Prerequisites

- Rights to open and merge a PR to `master` and to push a `v*` tag. **`master` is protected by a
  GitHub ruleset: nothing can be committed or pushed to it directly**, so the version bump goes
  through a pull request, and only the tag is pushed directly. (If the ruleset also restricts tag
  creation, the person pushing the tag needs to be on its bypass list.)
- **One-time npm Trusted Publisher setup** (CI *stages* the publish via OIDC — no tokens, no
  OTP). On [npmjs.com](https://www.npmjs.com/package/cordova-plugin-nabto) → the package →
  *Settings* → *Trusted Publisher*, add a GitHub Actions publisher (all fields case-sensitive):
  - Organization or user: `nabto`
  - Repository: `cordova-plugin-nabto`
  - Workflow filename: `publish.yml`
  - Environment: *(leave blank)*
  - Allowed action: `npm stage publish` (staged publishing — a maintainer approves with 2FA
    before the version goes live)

  This is required once; without it the stage-publish step fails with an OIDC auth error.
- **npm CLI ≥ 11.15.0** locally for the approval step (`npm stage approve`), or just approve in
  the npmjs.com UI.

## Steps

### 1. Prepare the release on a branch

`master` is protected, so make the release changes on a branch from an up-to-date `master`:

```sh
git checkout master && git pull
git checkout -b release-<new-version>        # e.g. release-3.0.3
```

Make sure everything for the release is already merged to `master`. Then:

1. Update `CHANGELOG.md`: rename the `## X.Y.Z Unreleased` section to the new version with today's
   date, and keep a fresh empty `## <next> Unreleased` section above it (see the guide at the top
   of the changelog).

   ```
   ## <next> Unreleased

   ## 3.0.3 2026-10-27      <- renamed from "Unreleased"
   ...
   ```

2. Bump the version without creating a commit or tag (those happen later):

   ```sh
   npm version <new-version> --no-git-tag-version    # e.g. npm version 3.0.3 (no leading v)
   ```

   This updates `version` in `package.json` and `package-lock.json`, and runs
   `scripts/sync-plugin-version.js` to update `plugin.xml` to the same version. For a pre-release
   use the rc convention, e.g. `npm version 3.1.0-rc1 --no-git-tag-version`.

3. Commit, push and open a PR:

   ```sh
   git commit -am "Release <new-version>"
   git push -u origin release-<new-version>
   gh pr create --base master --title "Release <new-version>"
   ```

Wait for CI (`version-consistency`, `pack`, Android and iOS builds) to pass and merge the PR.

### 2. Tag the merged commit

The tag must point at the commit on `master` that contains the bump. If the PR was squash- or
rebase-merged, that is the *new* commit on `master`, not your branch commit, so always tag from
an updated `master`:

```sh
git checkout master && git pull
node -p "require('./package.json').version"     # must print <new-version>
git tag -a v<new-version> -m "v<new-version>"   # e.g. v3.0.3
git push origin v<new-version>
```

Do not use `git push --follow-tags` or push `master`; only the tag is pushed. **Pushing the `v…`
tag is what triggers the release** — `.github/workflows/publish.yml` runs on any pushed tag
matching `v*`, **stages** the npm publish and creates a GitHub Release with auto-generated notes
(see below). The version is not live on npm yet — proceed to step 3.

### 3. Approve the staged publish (2FA)

CI stages the version to npm but cannot make it live (OIDC tokens can't approve). A maintainer
approves it with 2FA — either in the npmjs.com UI (package → **Staged Packages** → **Approve**),
or via the CLI:

```sh
npm stage list cordova-plugin-nabto      # find the <stage-id>
npm stage view <stage-id>                # (optional) inspect it
npm stage approve <stage-id>             # prompts for 2FA -> goes live
```

A clean semver release (e.g. `3.0.1`) is staged under npm's default `latest` dist-tag, applied
when you approve. A pre-release (anything with a suffix, e.g. `3.1.0-rc1`, `3.1.0-alpha.0`,
`3.1.0-beta.2`) is staged under a channel dist-tag derived from its pre-release identifier
(`rc` / `alpha` / `beta`, …) so it never lands on `latest`. CI does this automatically from the
tag name — no manual `--tag` needed.

The dist-tag is an **immutable** property of the staged package — it can't be changed at approval
time. If CI staged a release under the wrong dist-tag, `npm stage reject <stage-id>` it and re-stage
with the right tag (`npm stage publish --tag <tag>`) rather than approving.

### 4. Verify

After approval, confirm `cordova-plugin-nabto@<new-version>` is on npm (with a provenance badge),
under the expected dist-tag: `npm view cordova-plugin-nabto`. Also check the GitHub Release exists:
`gh release view v<new-version>`.

## What CI does automatically

- **`.github/workflows/build.yml`** (every PR and push to `master`): checks
  `package.json`/`plugin.xml` version consistency, packs the plugin, and builds it into a
  throwaway Cordova app on Android and iOS.
- **`.github/workflows/publish.yml`** (on push of a `v*` tag):
  1. verifies the tag matches `package.json`;
  2. **stages** the publish to npm via **OIDC trusted publishing** (`npm stage publish`, no
     tokens/OTP, provenance included) — a clean semver under the default `latest` dist-tag, a
     pre-release (`-rc`/`-alpha`/`-beta`/…) under its channel dist-tag instead — the version is
     NOT live until approved (step 3);
  3. creates a GitHub Release for the tag with auto-generated notes (flagged as a pre-release for
     `-rc`/`-alpha`/`-beta` tags).

## Summary

```sh
# 1. release branch: changelog + version bump, PR, merge
git checkout master && git pull && git checkout -b release-3.0.3
# edit CHANGELOG.md
npm version 3.0.3 --no-git-tag-version
git commit -am "Release 3.0.3" && git push -u origin release-3.0.3
gh pr create --base master --title "Release 3.0.3"      # merge when CI is green
# 2. tag the merged commit on master (only the tag is pushed; pushing it triggers CI,
#    which STAGES the npm publish and creates the GitHub Release)
git checkout master && git pull
git tag -a v3.0.3 -m "v3.0.3" && git push origin v3.0.3
# 3. approve the staged publish with 2FA (or use the npmjs.com Staged Packages tab)
npm stage list cordova-plugin-nabto
npm stage approve <stage-id>
# 4. verify
npm view cordova-plugin-nabto@3.0.3
```
