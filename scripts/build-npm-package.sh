#!/bin/bash
#
# Build cordova-plugin-nabto package and optionally deploy to npmjs.
#
# Note: Pollutes local repo with artifacts downloaded into plugin dirs, so clone repo just for
# building and throw away afterwards.
#
# $0 <artifact download url prefix> <target dir> [<deploy {yes|no|deploy-only}>]"
#
# If $3 is set and not set to false, NPM_USER, NPM_PASS and NPM_EMAIL env variables must have been
# set with relevant npmjs info.
#
 
set -e

DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DOWNLOAD_URL_PREFIX=$1
TARGET_DIR=$2
if [ ! -z "$3" ] && [ "$3" != "no" ]; then
    DEPLOY_TO_NPM=1
    if [ "$3" == "deploy-only" ]; then
        DEPLOY_ONLY=1
    fi
fi

BUILD_DIR=$DIR/..
CDV_ASSET_SUBDIR=src/nabto/ios
CDV_SRC_SUBDIR=src/ios

NPM_CLI_LOGIN=npm-cli-login

function die() {
    echo $1
    exit 1
}

function usage() {
    die "$0 <artifact download url prefix> <target dir> [<deploy {true|false}>]"
}

function check_args() {
    echo $#
    exit 1
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
        die "ERROR: NPM_PASS env variable must be set to npmjs password"
    fi
    if [ -z "$NPM_USER" ]; then
        die "ERROR: NPM_USER env variable must be set to npmjs password"
    fi
    if [ -z "$NPM_EMAIL" ]; then
        die "ERROR: NPM_EMAIL env variable must be set to npmjs password"
    fi

    set +e
    which $NPM_CLI_LOGIN > /dev/null 
    if [ $? != 0 ]; then
        die "ERROR: Missing $NPM_CLI_LOGIN please install and/or update path"
    fi
    set -e
}

function download() {
    local path=$1
    local output=$2
    local desc=`basename $path`
    echo "Downloading release artifact '$desc'"
    curl -fs $DOWNLOAD_URL_PREFIX/$path > $output || die "Download $desc failed"
}

function build() {
    if [ ! -z "$DEPLOY_ONLY" ]; then
        return
    fi
        
    local tmp_dir=`mktemp -d`
    local src_bundle=NabtoClient-src.zip
    download ios/ios-client-src/$src_bundle $tmp_dir/src.zip
    (cd $tmp_dir ; unzip src.zip ; mv NabtoClient/NabtoClient.* $BUILD_DIR/$CDV_SRC_SUBDIR)
    rm -rf $tmp_dir

    local lib_api=lib/libnabto_client_api_static.a
    local lib_ext=lib/libnabto_static_external.a
    local header=include/nabto_client_api.h
    download nabto/ios/${lib_api} $BUILD_DIR/$CDV_ASSET_SUBDIR/${lib_api}
    download nabto/ios/${lib_ext} $BUILD_DIR/$CDV_ASSET_SUBDIR/${lib_ext}
    download nabto/ios/${header}  $BUILD_DIR/$CDV_ASSET_SUBDIR/${header}

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
    node --max_old_space_size=8192 `which npm` publish --verbose
}

if [ $# -lt 2 ]; then
    usage
fi

prep_dirs
check_deploy_ready
build
deploy

