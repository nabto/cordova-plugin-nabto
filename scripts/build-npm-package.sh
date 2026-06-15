#!/bin/bash
#
# Pack the cordova-plugin-nabto npm package into <target dir>.
#
# Note: The iOS NabtoClient library is no longer vendored into the package; it is resolved at app
# build time via Swift Package Manager (see Package.swift), so building is just `npm pack`.
#
# Publishing to npm is handled by CI via OIDC trusted publishing on release (see
# .github/workflows/release.yml and RELEASE_PROCEDURE.md) - this script only packs.
#
# WARNING: <target dir> is wiped with `rm -rf` before building. Pass a dedicated output directory,
# NOT the plugin repo itself.
#
# $0 <target dir>
#
set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

TARGET_DIR=$1

BUILD_DIR=$DIR/..

function die() {
    echo $1
    exit 1
}

function prep_dirs() {
    if [ -z "$TARGET_DIR" ]; then
        die "ERROR: no <target dir> given. Usage: $0 <target dir>"
    fi
    # Guard against wiping the plugin repo or any ancestor: <target dir> is rm -rf'd below, so it
    # must be a dedicated output directory, not the repo root, the cwd, or a parent of the repo.
    local abs_target abs_build
    abs_target=$(cd "$TARGET_DIR" 2>/dev/null && pwd || echo "$TARGET_DIR")
    abs_build=$(cd "$BUILD_DIR" && pwd)
    if [ "$abs_target" == "/" ] || [ "$abs_target" == "$abs_build" ] || [ "$abs_target" == "$PWD" ]; then
        die "ERROR: refusing to 'rm -rf' target dir '$abs_target' - it is the repo/cwd. Pass a separate output directory."
    fi
    case "$abs_build/" in
        "$abs_target"/*) die "ERROR: refusing to 'rm -rf' target dir '$abs_target' - it contains the plugin repo." ;;
    esac
    rm -rf "$TARGET_DIR"
    mkdir -p "$TARGET_DIR"
}

function build() {
    # The iOS NabtoClient library and its native NabtoAPI dependency are no longer downloaded and
    # vendored here: they are pulled in by Swift Package Manager at app build time via the
    # https://github.com/nabto/nabto-ios-client dependency declared in Package.swift.
    echo "Pack npm module"
    cd $BUILD_DIR
    npm pack
    mv cordova-plugin-nabto-* $TARGET_DIR
}

prep_dirs
build
