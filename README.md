# Cordova Plugin Nabto

[Nabto ApS](http://nabto.com) client plugin for Cordova.

Nabto provides a full communication infrastructure to allow direct, encrypted communication between clients and IoT devices - the Nabto communication platform. The platform supports direct peer-to-peer connectivity through NAT traversal.

## Limitations

- Only Android and iOS support
- No Nabto streaming API
- Returned error can be both `NabtoStatus` and `NabtoError` objects.
- An HTML device driver containing the uNabto interface (`unabto_queries.xml`) is still required to communicate with the device

## Installation

1. Download Nabto libraries and assets to *cordova-plugin-nabto/src/nabto/* (See "Source File Structure" section). This step can be skipped if installing directly from [npm](https://www.npmjs.com/).
2. Install cordova plugin: `cordova plugin add cordova-plugin-nabto`.
3. For iOS projects replace linker flag "-ObjC" with "-force_load $(BUILT_PRODUCTS_DIR)/libCordova.a -lstdc++" (in platforms/ios/cordova/build.xcconfig)
4. Start using as described in the Example and API section.

## Example

The simplest possible example of using the Cordova uNabto plugin:
```js
// Wait for cordova to fully load
document.addEventListener('deviceready', function() {

  // Start Nabto and login as guest
  nabto.startup(function() {

    // Make a Nabto request to a device
    var url = 'nabto://demo.nabto.net/wind_speed.json?';
    nabto.fetchUrl(url, function(error, result) {

      // Print out the response
      if (!error && result.response) {
        console.log(result.response);
      }

    });

  });

}, false);
```

## Nabto API

See *www/nabto.js* for API implementation details.

All callbacks are invoked with an error object as the first argument if something went wrong, otherwise the first argument is set to undefined.

`NabtoStatus`: Maps to nabto client nabto_status enum.

`NabtoError`: Represents other wrapper layer errors.

Start Nabto and open a session with optional username and password.
```js
nabto.startup([username, password, ]callback)
```

Shuts down Nabto.
```js
nabto.shutdown(callback)
```

Makes a Nabto RPC request to a uNabto device (e.g., invokeRpc('nabto://demo.nabto.net/wind_speed.json?', function(err, res) { console.log(res); })).

Prior to invoking, the following must have been done (after startup):

* RPC interface must have been set with `nabto.rpcSetInterface(host, unabto_queries_xml)` or `nabto.rpcSetDefaultInterface(unabto_queries_xml)`. The interface file is the file formerly distributed centrally through HTML DD bundles in the nabto subdir.
* The function nabto.prepareInvoke(hosts) where `hosts` is an array of hostnames. 

```js
nabto.invokeRpc(url, callback)
```

Set Nabto RPC interface for specific host. See section 6.2 in TEN024 for
format (note that the key HTML DD concept in that document is deprecated, the
mentioned section will soon be available in a new location).

```js
nabto.rpcSetInterface(host, unabto_queries_xml, callback)
```

Set default Nabto RPC interface to use if not overriden with host
specific version (`rpcSetInterface`). See section 6.2 in TEN024 for
format (note that the key HTML DD concept in that document is deprecated, the
mentioned section will soon be available in a new location).

```js
nabto.rpcSetDefaultInterface(host, unabto_queries_xml, callback)
```


Mandatory to invoke prior to `nabto.invokeRpc` after each
`nabto.startup` invocation. This function may show a fullscreen ad if
`hosts` contains a device associated with an AMP free tier product. An
ad may also be shown if a previous invocation since last
`nabto.startup` contained such free tier device.

```js
nabto.prepareInvoke(hosts, callback)
```

Get local Nabto devices.
Callback is invoked with an array of device strings.
```js
nabto.getLocalDevices(callback)
```

Get Nabto client version.
Callback is invoked with a string.
```js
nabto.version(callback)
```

## Source File Structure

Install from npm to get all necessary libraries and resources installed in the right location.

```
src
├── android
│   └── *
├── ios
│   └── *
└── nabto
    ├── assets.md
    ├── android-arm
    │   └── lib
    │       └── libnabto_client_api_jni.so
    ├── android-armv7
    │   └── lib
    │       └── libnabto_client_api_jni.so
    ├── android-x86
    │   └── lib
    │       └── libnabto_client_api_jni.so
    └── ios
        ├── include
        │   └── nabto_client_api.h
        ├── lib
        │   ├── libnabto_client_api_static.a
        │   └── libnabto_static_external.a
        └── share
            └── nabto
                ├── configuration
                ├── roots
                ├── schemas
                ├── skins
                └── users
```

## Run Tests

1. Create a new Cordova project and install `cordova-plugin-nabto` as described above
2. Also install the `/tests` subproject (cordova plugin add https://github.com/nabto/cordova-plugin-nabto.git#:/tests)
3. Install the Cordova test framework plugin: `cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-test-framework.git`
4. Install the Cordova device plugin: `cordova plugin add cordova-plugin-device`
5. Add `<content src="cdvtests/index.html" />` to the projects `config.xml` 
6. Run on the platform you wish to test
