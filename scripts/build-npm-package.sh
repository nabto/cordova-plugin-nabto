#!/bin/bash
#
# Build cordova-plugin-nabto package and optionally deploy to npmjs.
#
# Note: The iOS NabtoClient library is no longer vendored into the package; it is resolved at app
# build time via Swift Package Manager (see Package.swift), so building is just `npm pack`.
#
# WARNING: <target dir> is wiped with `rm -rf` before building. Pass a dedicated output directory,
# NOT the plugin repo itself.
#
# $0 <target dir> [<deploy {yes|no|deploy-only}>]"
#
# If $3 is set and not set to false, NPM_USER, NPM_PASS and NPM_EMAIL env variables must have been
# set with relevant npmjs info.
#
 
set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

TARGET_DIR=$1
if [ ! -z "$2" ] && [ "$2" != "no" ]; then
    DEPLOY_TO_NPM=1
    if [ "$2" == "deploy-only" ]; then
        DEPLOY_ONLY=1
    fi
fi

BUILD_DIR=$DIR/..

NPM_CLI_LOGIN=npm-cli-login

function die() {
    echo $1
    exit 1
}

function usage() {
    die "$0 <target dir> [<deploy {yes|no}>]"
}

function prep_dirs() {
    if [ -z "$TARGET_DIR" ]; then
        die "ERROR: no <target dir> given"
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

function check_deploy_ready() {
    if [ -z "$DEPLOY_TO_NPM" ]; then
        return
    fi
    if [ -z "$NPM_PASS" ]; then
        die "ERROR: NPM_PASS env variable must be set for npmjs deployment"
    fi
    if [ -z "$NPM_USER" ]; then
        die "ERROR: NPM_USER env variable must be set for npmjs deployment"
    fi
    if [ -z "$NPM_EMAIL" ]; then
        die "ERROR: NPM_EMAIL env variable must be set for npmjs deployment"
    fi

    set +e
    which $NPM_CLI_LOGIN > /dev/null 
    if [ $? != 0 ]; then
        die "ERROR: Missing $NPM_CLI_LOGIN please install and/or update path"
    fi
    set -e
}

function build() {
    if [ ! -z "$DEPLOY_ONLY" ]; then
        return
    fi

    # The iOS NabtoClient library and its native NabtoAPI dependency are no longer downloaded and
    # vendored here: they are pulled in by Swift Package Manager at app build time via the
    # https://github.com/nabto/nabto-ios-client dependency declared in Package.swift.
    echo "Pack npm module"
    cd $BUILD_DIR
    npm pack
    mv cordova-plugin-nabto-* $TARGET_DIR
}

function deploy() {
    if [ -z "$DEPLOY_TO_NPM" ]; then
        return
    fi
    cd $BUILD_DIR

    VERSION=$(node -p "require('./package.json').version")
    TAG_ARG=""
    echo "$VERSION" | grep -Eq 'rc[0-9]*$|rc\.[0-9]+$'
    if [ $? -eq 0 ]; then
        TAG_ARG="--tag=rc"
    fi

    echo -n "Enter npm OTP: "
    read NPM_OTP
    if [ -z "$NPM_OTP" ]; then
        echo "ERROR: No OTP entered, aborting publish"
        return 1
    fi

    set +e
    NODE_OUTPUT=`mktemp`
    node --max_old_space_size=8192 `which npm` publish --verbose $TAG_ARG --otp="$NPM_OTP" 2>&1 | tee $NODE_OUTPUT 2>&1
    if [ ${PIPESTATUS[0]} != 1 ]; then
        local msg="check download page https://www.npmjs.com/package/cordova-plugin-nabto to see if package is actually updated. If not, try again."
        grep -q "first byte timeout" $NODE_OUTPUT
        if [ $? == 0 ]; then
            echo "npm says upload failed, but it is likely just a wrong error message - $msg"
            return 0
        else
            echo "Upload to npm failed with an unexpected error - $msg"
            return 1
        fi
    fi
}

if [ $# -lt 2 ]; then
    usage
fi

prep_dirs
check_deploy_ready
build
deploy

exit $?



