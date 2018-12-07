#!/bin/bash
#
# Build cordova-plugin-nabto package and optionally deploy to npmjs.
#
# Note: Pollutes local repo with artifacts downloaded into plugin dirs, so clone repo just for
# building and throw away afterwards.
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

STATIC_BUNDLE_URL=https://downloads.nabto.com/assets/nabto-ios-client-static/4.4.0/nabto-libs-ios-static.zip
BUILD_DIR=$DIR/..
CDV_ASSET_SUBDIR=src/nabto/ios
CDV_SRC_SUBDIR=src/ios

NPM_CLI_LOGIN=npm-cli-login

function die() {
    echo $1
    exit 1
}

function usage() {
    die "$0 <target dir> [<deploy {true|false}>]"
}

function prep_dirs() {
    rm -rf $TARGET_DIR
    mkdir -p $TARGET_DIR
    mkdir -p $BUILD_DIR/$CDV_ASSET_SUBDIR/lib
    mkdir -p $BUILD_DIR/$CDV_ASSET_SUBDIR/include
    mkdir -p $BUILD_DIR/$CDV_SRC_SUBDIR
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

    # TODO: use submodule or cocoapod instead
    local tmp_dir=`mktemp -d`
    (cd $tmp_dir ; git clone git@github.com:nabto/nabto-ios-client.git ; cd nabto-ios-client ; cp NabtoClient/NabtoClient.* $BUILD_DIR/$CDV_SRC_SUBDIR)

    local lib_api=lib/libnabto_client_api_static.a
    local lib_ext=lib/libnabto_static_external.a
    local header=include/NabtoAPI/nabto_client_api.h
    local archive=$tmp_dir/lib.zip
    curl -o $archive $STATIC_BUNDLE_URL

    local libdir=$BUILD_DIR/$CDV_ASSET_SUBDIR/lib
    local incdir=$BUILD_DIR/$CDV_SRC_SUBDIR/NabtoAPI
    local prefix=nabto-libs-ios-static/ios
    mkdir -p $libdir
    mkdir -p $incdir
    tmp_dir=`mktemp -d`
    (cd $tmp_dir ; unzip $archive ; mv $prefix/lib/*.a $libdir ; mv $prefix/include/*.h $incdir)
    rm -rf $tmp_dir
    
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

    $NPM_CLI_LOGIN
    
    set +e
    NODE_OUTPUT=`mktemp`
    node --max_old_space_size=8192 `which npm` publish --verbose 2>&1 | tee $NODE_OUTPUT 2>&1
    if [ ${PIPESTATUS[0]} != 1 ]; then
        local msg="check download page https://www.npmjs.com/package/cordova-plugin-nabto to see if package is actually updated. If not, try again."
        grep -q "first byte timeout" $NODE_OUTPUT
        if [ $? == "0" ]; then
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



