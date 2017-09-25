# Change Log

All notable changes to this project will be documented in this file. This projects changelog started
with version [2.2.0] 2017-09-05 for change logs prior to this date contact Nabto and/or look in git
history.

The format is based on [Keep a Changelog](http://keepachangelog.com/)

Guide: always keep an unreleased section which keeps track of current
changes. When a release is made the unreleased section is renamed to
the release and a new unreleased section is added.

## 2.4.0 Unreleased

## 2.3.0 2017-09-25
 
### Added
- Added `setStaticResourceDir` to set a custom directory to hold resources (useful for custom config file).
- Added `setBasestationAuthJson` to set basestation auth JSON info for certificate-less authentication (see full docs in nabto_client_api.h).
- Added `removeKeyPair` to remove a keypair.
- Added missing `setOption` on iOS to set custom options.
- Added `tunnelError` to detailed info on tunnel errors.
- Added unit tests of all API functions.

### Changed
- Removed `openSession` from iOS and Android platform adapter interfaces as it was not exposed through the JS wrapper anyway, only the `startupAndOpenProfile` singleton approach is supported on Cordova.

### Breaking


## 2.2.0 2017-09-05

### Added
- NABTO-1592: Add tunnel API functions in Cordova plugin

### Removed
- Tests has been removed from the tests subdir and instead added to a separate repo (cordova-plugin-nabto-test). Tests might later be moved back but currently Cordova chokes on them in the main repo.

### Changed
- Deprecated `version` in favor of `versionString` to retrieve the full Nabto SDK semver version,
  including pre-release suffix

### Breaking Changes
- None