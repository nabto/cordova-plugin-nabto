# Cordova Plugin Nabto

[Nabto ApS](http://nabto.com) client plugin for Cordova.

Nabto provides a full communication infrastructure to allow direct, encrypted communication between clients and IoT devices - the Nabto communication platform. The platform supports direct peer-to-peer connectivity through NAT traversal.

## Limitations

- Only Android and iOS support
- No streaming or tunnel API
- Handling of other Cordova errors (becomes a `NabtoStatus`)
- Not packaged and published to cordova.apache.org (yet)

## Installation

1. Download Nabto libraries, assets and wrapper classes to *cordova-plugin-nabto/src/nabto/* (See "Source File Structure" section). This step will be removed when the finished package is deployed.
2. Install cordova plugin: `cordova plugin add cordova-plugin-nabto`.
3. For iOS projects replace linker flag "-ObjC" with "-force_load $(BUILT_PRODUCTS_DIR)/libCordova.a -lstdc++".
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
    nabto.fetchUrl(url, function(status, result) {

      // Print out the response
      if (!status && result.response) {
        console.log(result.response);
      }

    });

  });

}, false);
```

## API

See *www/nabto.js* for API implementation details.

Start Nabto and open a session with optional username and password. Callback is invoked with a `NabtoStatus` object if something went wrong.
```js
nabto.startup([username, password, ]callback)
```

Shuts down Nabto. Callback is invoked with a `NabtoStatus` object if something went wrong.
```js
nabto.shutdown(callback)
```

Makes a Nabto request to a uNabto device url. Callback is invoked with a `NabtoStatus` and a response object.
```js
nabto.fetchUrl(url, callback)
```

Get the active session token. Callback is invoked with a string.
```js
nabto.getSessionToken(callback)
```

Get local Nabto devices. Callback is invoked with an array of device strings.
```js
nabto.getLocalDevices(callback)
```

Get Nabto client version. Callback is invoked with a string.
```js
nabto.version(callback)
```

## Source File Structure

```
src
├── android
│   └── *
├── ios
│   └── *
└── nabto
    ├── android-arm
    │   └── lib
    │       └── libnabto_client_api_jni.so
    ├── android-armv7
    │   └── lib
    │       └── libnabto_client_api_jni.so
    ├── android-x86
    │   └── lib
    │       └── libnabto_client_api_jni.so
    ├── include
    │   └── nabto_client_api.h
    ├── ios
    │   └── lib
    │       ├── libnabto_client_api_static.a
    │       └── libnabto_static_external.a
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
2. Also install the `cordova-plugin-nabto` /tests subproject.
3. Install the Cordova test framework plugin: `cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-test-framework.git`
4. Add `<content src="cdvtests/index.html" />` to the projects `config.xml`
5. Run on the platform you wish to test
