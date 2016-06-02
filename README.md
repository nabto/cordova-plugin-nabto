# Cordova Plugin Nabto

[Nabto ApS](http://nabto.com) client plugin for Cordova.

Nabto provides a full communication infrastructure to allow direct, encrypted communication between clients and IoT devices - the Nabto communication platform. The platform supports direct peer-to-peer connectivity through NAT traversal.

## Limitations

- Only Android and iOS support
- No Nabto streaming API
- Handling of rare other Cordova errors (becomes a `NabtoStatus`)
- An HTML device driver containing the uNabto interface (`unabto_queries.xml`) is still required to communicate with the device

## Installation

1. Download Nabto libraries and assets to *cordova-plugin-nabto/src/nabto/* (See "Source File Structure" section). This step can be skipped if installing directly from [npm](https://www.npmjs.com/).
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

## Nabto API

See *www/nabto.js* for API implementation details.

All callbacks are invoked with a `NabtoStatus` object as the first argument if something went wrong, otherwise the first argument is set to undefined.

Start Nabto and open a session with optional username and password.
```js
nabto.startup([username, password, ]callback)
```

Shuts down Nabto.
```js
nabto.shutdown(callback)
```

Makes a Nabto request to a uNabto device url.
Callback is invoked with a response object.
```js
nabto.fetchUrl(url, callback)
```

Get the active session token.
Callback is invoked with a string.
```js
nabto.getSessionToken(callback)
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

## Nabto Tunnel API

Open a TCP tunnel over Nabto to the given host and port.
Use `nabto.tunnelPort` to get the tunnel's local port.
```js
nabto.tunnelOpenTcp(host, port, callback)
```

Get the Nabto tunnel version.
Callback is invoked with a version number.
```js
nabto.tunnelVersion(callback)
```

Get the open tunnel state.
Callback is invoked with a `NabtoTunnelState` object.
```js
nabto.tunnelState(callback)
```

Get the last error of the open tunnel.
Callback is invoked with a `NabtoStatus` object.
```js
nabto.tunnelLastError(callback)
```

Get the open tunnel local port.
Callback is invoked with a port number.
```js
nabto.tunnelPort(callback)
```

Close the previously opened tunnel.
```js
nabto.tunnelClose(callback)
```

## Source File Structure

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
2. Also install the `cordova-plugin-nabto` /tests subproject.
3. Install the Cordova test framework plugin: `cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-test-framework.git`
4. Add `<content src="cdvtests/index.html" />` to the projects `config.xml`
5. Run on the platform you wish to test
