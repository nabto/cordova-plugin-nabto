> **Warning**
> Deprecation notice: This SDK is for Nabto 4/Micro (uNabto). For new projects, the next generation Nabto 5/Edge should be used instead. Read about the differences [here](https://docs.nabto.com/developer/guides/concepts/overview/edge-vs-micro.html). Nabto 5/Edge provides no direct Cordova support - but provides [iOS](https://docs.nabto.com/developer/platforms/ios/intro.html) and [Android SDK](https://docs.nabto.com/developer/platforms/android/intro.html)s that are straightforward to wrap from Cordova and Ionic Capacitor. 

# Cordova Plugin Nabto - 2.6

Legacy [Nabto 4/Micro](https://www.nabto.com) client plugin for Cordova.

Nabto provides a full communication infrastructure to allow direct, encrypted communication between clients and IoT devices - the Nabto communication platform. The platform supports direct peer-to-peer connectivity through NAT traversal with fallback through central relay.

The Cordova plugin allows hybrid client apps to use Nabto RPC to invoke uNabto devices, i.e. to retrieve data or control the device. And use Nabto Tunnelling to establish TCP tunnels to devices for reliable two-way communication.

See the [AppMyProduct Heat Control](https://github.com/nabto/ionic-starter-nabto) starter app for a full example of using Nabto RPC and [AppMyProduct Video](https://github.com/nabto/ionic-starter-nabto-video) for a full example of using Nabto Tunnelling. For further details about the tunnel example, also see [our blog](https://blog.nabto.com/2017/09/11/raspberry-pi-webcam-with-secure-remote-access).

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

## Note about version identifiers

The version information returned by `nabto.versionString` is the core Nabto Client SDK version - _not_ the version of the Cordova wrapper (the component described in this document). 

## Note about older Android devices

On Android 4.4 and older, please pass the `--browserify` option to the cordova CLI (not necessary to worry about if invoking through Ionic), e.g. `cordova build android --browserify`, this fixes a problem with `require` not being available.

## Nabto API

See *www/nabto.js* for API implementation details.

All callbacks are invoked with an error object as the first argument if something went wrong, otherwise the first argument is set to undefined.

### `nabto.startupAndOpenProfile`

Starts Nabto and establish a client session using specified username and password (locates an installed keypair associated with `username` and decrypts the private key with `password`).

```js
nabto.startupAndOpenProfile(username, password, callback)
```

### `nabto.startup`

Starts Nabto without an associated client session (so cannot invoke remote devices).

```js
nabto.startup(callback)
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

Mandatory to invoke prior to `nabto.invokeRpc` or `nabto.tunnelOpenTcp` after each `nabto.startup`
invocation to enable later connection one of the listed hosts. This function may show a fullscreen
ad if `hosts` contains a device associated with an AMP free tier product. An ad may also be shown if
a previous invocation since last `nabto.startup` contained such free tier device.

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

### `nabto.removeKeyPair`

Remove keypair from local store.

```js
nabto.removeKeyPair(id, callback)
```

### `nabto.createSignedKeyPair` (deprecated)

Create CA signed keypair to be used for uNabto device and basestation based
authentication. Specified email address and password are used for authenticating towards the central
user management services used by the CA to verify the user's identity. The password is also used for
encrypting the local private key.

```js
nabto.createSignedKeyPair(email, password, callback)
```

Note: In the current (deprecated) implementation the encryption of the local key using the same
password as for the CA services causes a poor user experience if user has a profile on multiple
devices and resets password on a single device: When the user starts the app and enters a password,
the private key is decrypted meaning that in all other app instances than the one through which the
password was reset, the old password must be used.

The app developer must implement a mechanism to detect such reset and re-create keypairs on all
devices to set the same password for all key pairs. If this feature was not deprecated in the first
place (see below), a new behavior would indeed have been considered (e.g., when possible, skip
private key encryption and use platform specific certificate store).

Deprecation notice: The Nabto CA services are no longer part of the standard platform and requires a
customer specific setup. New solutions must base their security design on PPKA approach (see section
8.2 in [TEN036 Security in Nabto
Solutions](https://www.nabto.com/downloads/docs/TEN036%20Security%20in%20Nabto%20Solutions.pdf)) or
the authentication token approach using `setBaseStationAuthJson`.

### `nabto.signup` (deprecated)

Signup for a user profile through the central user management services. 

```js
nabto.signup(email, password, callback)
```

Deprecation notice: The Nabto CA services are no longer part of the standard platform and requires a
customer specific setup. New solutions must base their security design on PPKA approach (see section
8.2 in [TEN036 Security in Nabto
Solutions](https://www.nabto.com/downloads/docs/TEN036%20Security%20in%20Nabto%20Solutions.pdf)) or
the authentication token approach using `setBaseStationAuthJson`.

### `nabto.resetAccountPassword` (deprecated)

Reset user's account password in the central user management services. See note on
`createSignedKeyPair` preventing a poor user experience.

```js
nabto.resetAccountPassword(email, callback)
```

Deprecation notice: The Nabto CA services are no longer part of the standard platform and requires a
customer specific setup. New solutions must base their security design on PPKA approach (see section
8.2 in [TEN036 Security in Nabto
Solutions](https://www.nabto.com/downloads/docs/TEN036%20Security%20in%20Nabto%20Solutions.pdf)) or
the authentication token approach using `setBaseStationAuthJson`.


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

### `nabto.setOption`

Set a configuration option supported by `nabtoSetOption` in the native SDK.

```js
nabto.setOption("urlPortalHostName", "webservice.nabto", callback)
```


### `nabto.setStaticResourceDir`

Set the directory where static resources are read from. Use with `cordova-plugin-file` to get absolute path (ok to include `file://` prefix).

```js
nabto.setStaticResourceDir(cordova.file.dataDirectory, callback)
```

### `nabto.setBaseStationAuthJson`

Set JSON document with basestation authentication info to use on the active session for next connect attempt. Requires configuration of authentication webhook in basestation. Use empty string to reset. See `nabto_client_api.h` for more details.

```js
nabto.setBaseStationAuthJson(jsonString, callback)
```


### `nabto.setLocalConnectionPsk`

Set pre-shared key to use for encrypting local connections. See `nabto_client_api.h` for more details.

```js
nabto.setLocalConnectionPsk(<host>, <hex pskId>, <hex psk>)
```

For example:

```js
nabto.setLocalConnectionPsk("mydevice.mydomain.nabto.net",
                                "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
                                "66:64:94:5f:e5:30:e0:15:d9:77:01:13:78:e9:37:e7");
```                               

Delimiter (e.g. `:`) is optional.

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

Earlier Cordova supported tests in a sub-plugin but apparently this is no longer possible, so we
have moved tests to a separate repository: https://github.com/nabto/cordova-plugin-nabto-test.

Tests can be executed using
https://github.com/nabto/cordova-plugin-nabto-test/blob/master/scripts/cdv-plugin-build.sh, it will
cleanly create a new project and completely uninstall and re-install the plugin as described above.


