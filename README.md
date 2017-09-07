# Cordova Plugin Nabto - 2.2

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
  nabto.startupAndOpenProfile(function() {

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

## Note about older Android devices

On Android 4.4 and older, please pass the `--browserify` option to the cordova CLI (not necessary to worry about if invoking through Ionic), e.g. `cordova build android --browserify`, this fixes a problem with `require` not being available.

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
nabto.invokeRpc(url, callback)
```

For example:

```js
nabto.invokeRpc('nabto://demo.nabto.net/wind_speed.json?', function(err, res) {
  console.log(res);
})`
```

Prior to invoking, the following must have been done (after startup):

* RPC interface must have been set with `nabto.rpcSetInterface(host, unabto_queries_xml)` or `nabto.rpcSetDefaultInterface(unabto_queries_xml)`. The interface file is the file formerly distributed centrally through HTML DD bundles in the nabto subdir.
* The function nabto.prepareInvoke(hosts) where `hosts` is an array of hostnames. 

`nabto.invokeRpc()` is equivalent to `nabto.fetchUrl()` on JSON URLs in earlier versions of the SDK; devices invoked earlier with `nabto.fetchUrl()` can be invoked in exactly the same way and the resulting response objects are identical. It is only a matter of simpler management, cf. the description above.

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

### `nabto.versionString`

Get Nabto client version.
Callback is invoked with a string.
```js
nabto.versionString(callback)
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

### `nabto.tunnelOpenTcp`

Open a tunnel to specified nabto host, connecting to specified TCP port on the remote host. When a
connection is established, a callback is invoked with a tunnel handle used for later
operations. If success, TCP clients can now connect to the local port that can be queried with
`tunnelPort`.

```js
nabto.tunnelOpenTcp("streamdemo.nabto.net", 80, callback)
```

### `nabto.tunnelPort`

Retrieve the local TCP port number of the specified tunnel handle (tunnel opened with
tunnelOpenTcp).

### `nabto.tunnelClose`

Close tunnel associated with the specified tunnel handle to free up resources on the target device.

### `nabto.tunnelState`

Get the tunnel state, an integer from the following enum - see `nabto_client_api.h` for details:

```
enum nabto_tunnel_state {
    NTCS_CLOSED = -1,
    NTCS_CONNECTING = 0,
    NTCS_READY_FOR_RECONNECT = 1,
    NTCS_UNKNOWN = 2,
    NTCS_LOCAL = 3,
    NTCS_REMOTE_P2P = 4,
    NTCS_REMOTE_RELAY = 5,
    NTCS_REMOTE_RELAY_MICRO = 6
};
```

## Source File Structure

Install from npm to get all necessary libraries and resources installed in the right location.

For development of the plugin itself, install with a reference to this git repo. The Nabto Android
wrapper and dependencies is installed automatically from bintray. For iOS, Cordova does not support
dynamic frameworks in Cocoapods.

So for iOS, do the following:

1. Download the iOS <a href="https://www.nabto.com/downloads.html">wrapper source</a> (Libraries > Source > [iOS link in table]) - unpack and put the source files in `./src/ios`.
2. Download the <a href="https://www.nabto.com/downloads.html">static Nabto Client SDK core libraries</a> - unpack and put .a files in `./src/nabto/ios/lib` and header files in `./src/nabto/ios/include`.

That is, make sure you have the following directory structure:


```
src
├── ios
│   ├── CDVNabto.m
│   ├── ...
│   ├── NabtoClient.mm
│   ├── NabtoClient.h
└── nabto
    └── ios
        ├── include
        │   └── nabto_client_api.h
        ├── lib
        │   ├── libnabto_client_api_static.a
        │   └── libnabto_static_external.a
```

## Run Tests

The development lifecycle for Cordova plugins is not very smooth; in our experience it is simplest
to completely remove all traces of the plugin and install again for every change/test cycle. As the
Nabto libs are quite big, a lot of time goes copying these files around, you might optimize the
cycle this by just using libraries for the exact platform you are working on.

1. Create a new Cordova project
2. Add `<content src="cdvtests/index.html" />` to the project's `config.xml` 
3. Install the Cordova test framework plugin: `cordova plugin add https://github.com/maverickmishra/cordova-plugin-test-framework.git`
4. Install `cordova-plugin-nabto`: `cordova plugin add ~/git/cordova-plugin-nabto` (see note about optimization)
5. Install `cordova-plugin-nabto-test`: `cordova plugin add ~/git/cordova-plugin-nabto-tests`
6. Patch build.xcconfig as outlined above if using iOS
7. Build and run on the intended platform

For every change, clean up and run from step 4 - e.g. put the following in a script:

```
rm -rf  ~/.npm/cordova-plugin-nabto*
npm uninstall cordova-plugin-nabto
cordova plugin rm cordova-plugin-nabto-tests
cordova plugin rm cordova-plugin-nabto

cordova plugin add ~/git/cordova-plugin-nabto
cordova plugin add ~/git/cordova-plugin-nabto-tests

echo 'OTHER_LDFLAGS = -force_load $(BUILT_PRODUCTS_DIR)/libCordova.a -lstdc++' >> platforms/ios/cordova/build.xcconfig

cordova build ios
cordova emulate ios
```

