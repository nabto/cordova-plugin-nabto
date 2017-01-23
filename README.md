# Cordova Plugin Nabto - 2.0 BETA

[Nabto ApS](https://www.nabto.com) client plugin for Cordova.

Nabto provides a full communication infrastructure to allow direct, encrypted communication between clients and IoT devices - the Nabto communication platform. The platform supports direct peer-to-peer connectivity through NAT traversal with fallback through central relay.

The Cordova plugin allows hybrid client apps to use Nabto RPC to invoke uNabto devices, i.e. to retrieve data or control the device.

For an example of such a hybrid app, see [Ionic Starter for Nabto / AppMyProduct](https://github.com/nabto/ionic-starter-nabto).

## Installation

1. Download Nabto libraries and assets to *cordova-plugin-nabto/src/nabto/* (See "Source File Structure" section). This step can be skipped if installing directly from [npm](https://www.npmjs.com/).
2. Install cordova plugin: `cordova plugin add cordova-plugin-nabto`.
3. For iOS projects replace linker flag `-ObjC` with `-force_load $(BUILT_PRODUCTS_DIR)/libCordova.a -lstdc++` (in platforms/ios/cordova/build.xcconfig)
4. Start using as described in the Example and API section.

## Example

A simple example using the Cordova Nabto plugin:
```js
// Wait for cordova to fully load
document.addEventListener('deviceready', function() {
  
  // Start Nabto and login as guest
  nabto.startup(function() {

    // set the device interface definition to use
    nabto.rpcSetDefaultInterface("<unabto_queries><query name='my_wind_speed.json' id='2'><request></request><response format='json'><parameter name='speed' type='uint32'/></response></query></unabto_queries>", function() {

      // prepare invocation - note: may show a full screen ad if device is associated a free tier AMP product
      nabto.prepareInvoke(['demo.nabto.net'], function() {

        // invoke a function on the device
        nabto.rpcInvoke('nabto://demo.nabto.net/my_wind_speed.json?', function(error, result) {
          if (error) {
            console.log(error.message);
          } else {
            if (result.response) {
              console.log(result.response);
            }
          }
        });
      });
    });
  });

}, false);
```

## Nabto API

See *www/nabto.js* for API implementation details.

All callbacks are invoked with an error object as the first argument if something went wrong, otherwise the first argument is set to undefined.

### `nabto.startup`

Start Nabto and open a session with optional username and password.

```js
nabto.startup([username, password, ]callback)
```

### `nabto.shutdown`

Shuts down Nabto.

```js
nabto.shutdown(callback)
```

### `nabto.rpcInvoke`

Makes a Nabto RPC request to a uNabto device:

```js
nabto.invokeRpc('nabto://demo.nabto.net/wind_speed.json?', function(err, res) {
  console.log(res);
})`
```

Prior to invoking, the following must have been done (after startup):

* RPC interface must have been set with `nabto.rpcSetInterface(host, unabto_queries_xml)` or `nabto.rpcSetDefaultInterface(unabto_queries_xml)`. The interface file is the file formerly distributed centrally through HTML DD bundles in the nabto subdir.
* The function nabto.prepareInvoke(hosts) where `hosts` is an array of hostnames. 

`nabto.invokeRpc()` is equivalent to `nabto.fetchUrl()` on JSON URLs in earlier versions of the SDK; devices invoked earlier with `nabto.fetchUrl()` can be invoked in exactly the same way and the resulting response objects are identical. It is only a matter of simpler management, cf. the description above.

```js
nabto.invokeRpc(url, callback)
```

### `nabto.rpcSetDefaultInterface`

Set Nabto RPC interface for specific host. See section 6.2 in TEN024 for
format (note that the key HTML DD concept in that document is deprecated, the
mentioned section will soon be available in a new location).

```js
nabto.rpcSetInterface(host, unabto_queries_xml, callback)
```

### `nabto.rpcSetDefaultInterface`

Set default Nabto RPC interface to use if not overriden with host
specific version (`rpcSetInterface`). See section 6.2 in TEN024 for
format (note that the key HTML DD concept in that document is deprecated, the
mentioned section will soon be available in a new location).

```js
nabto.rpcSetDefaultInterface(host, unabto_queries_xml, callback)
```

### `nabto.prepareInvoke`

Mandatory to invoke prior to `nabto.invokeRpc` after each
`nabto.startup` invocation. This function may show a fullscreen ad if
`hosts` contains a device associated with an AMP free tier product. An
ad may also be shown if a previous invocation since last
`nabto.startup` contained such free tier device.

```js
nabto.prepareInvoke(hosts, callback)
```

### `nabto.getLocalDevices`

Get local Nabto devices.
Callback is invoked with an array of device strings.
```js
nabto.getLocalDevices(callback)
```

### `nabto.version`

Get Nabto client version.
Callback is invoked with a string.
```js
nabto.version(callback)
```

### `nabto.createKeyPair`

Create selfsigned keypair to be used for RSA fingerprint based authentication in uNabto devices.

```js
nabto.createKeyPair(name, private_key_encryption_password, callback)
```

### `nabto.getFingerprint`

Get RSA fingerprint for public key in specified keypair.

```js
nabto.getFingerprint(name, callback)
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
