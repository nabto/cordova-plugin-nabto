#!/bin/bash

echo "Installing Nabto libraries using post install script (work around for NABTO-1347)"

SDKS=nabto-sdk-ios-3.0.15-beta1.tar.gz

for f in ${SDKS}; do
    tmp=`mktemp`
    url=https://download.nabto.com/npm-libs/x-$f
    curl -# $url > $tmp
    if [ $? != "0" ]; then
       echo "FATAL: Download of $url failed."
       rm -f $tmp
       exit 1
    fi
    cd src
    tar xvfz $tmp
    rm -f $tmp
done

