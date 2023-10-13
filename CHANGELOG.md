# Change Log

All notable changes to this project will be documented in this file. This projects changelog started
with version [2.2.0] 2017-09-05 for change logs prior to this date contact Nabto and/or look in git
history.

The format is based on [Keep a Changelog](http://keepachangelog.com/)

Guide: always keep an unreleased section which keeps track of current
changes. When a release is made the unreleased section is renamed to
the release and a new unreleased section is added.

## 2.7.0 Unreleased

### Changed

- Add option `forceBindToWifi` that can be set with `setOption()`. If set on Android, all network
  traffic is routed to the WiFi interface, even if it does not have internet access: This is to
  remedy an often seen problem on newer Android devices when connected to a WiFi in AP mode during
  bootstrap (when there typically is no internet) - the Android system then routes all traffic to
  the cellular network interface, preventing direct device communication. This new option works
  around this behavior.

## 2.6.4 2023-08-25

### Changed
- Update to Nabto Client SDK 4.7.0 to fix guest.crt issue.


## 2.6.3 2019-10-21

### Changed
- Fix missing tunnel container initialization on iOS when invoking `startupAndOpenProfile`.

## 2.6.2 2019-08-22

### Changed
- Wrap native Nabto Client SDK 4.4.2: Add Android x86_64 support

## 2.6.1 2019-08-09

### Changed
- Wrap native Nabto Client SDK 4.4.1: Re-introduce armv7 support as default Cordova builds break otherwise (app store may choke on 32-bit binaries, though - contact us if you observe this)


## 2.6.0 2018-12-07

### Changed
- Wrap native Nabto Client SDK 4.4.0
- Add PSK functions (missing from previous wrapper of 4.3)
- Build using NabtoClient in public repo

## 2.5.1 2018-10-19

### Changed
- Fix NABTO-1884 (Android shutdown hangs if connect attempt is in progress, an issue in all plugin versions), fix Android race conditions (issue in version 2.0 and later).

## 2.5.0 2018-10-17

### Changed
- Wrap native Nabto Client SDK 4.3.0

## 2.4.6 2018-04-25

### Changed
- Added missing iOS simulator architectures.

## 2.4.5 2018-04-05

### Changed
- Fix iOS problem where session could not be closed while waiting for RPC invoke to timeout.

## 2.4.4 2018-01-11

### Changed
- Fix for compile error for android studio 3

## 2.4.1 2017-10-10

### Changed
- Nabto Client SDK 4.1.12 with fix for wrong handling of unicode characters in certificate names (AMP-135)

## 2.4.0 2017-10-05

### Added
- Added support for legacy functions for signup and password reset to allow for migration of existing apps.

### Changed
- Major cleanup of JS wrapper.

### Breaking

## 2.3.0 2017-09-25

### Added
- Added `setStaticResourceDir` to set a custom directory to hold resources (useful for custom config file).
- Added `setBasestationAuthJson` to set basestation auth JSON info for certificate-less authentication (see full docs in nabto_client_api.h).
- Added `removeKeyPair` to remove a keypair.
- Added missing `setOption` on iOS to set custom options.
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
