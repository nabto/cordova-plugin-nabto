/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

var exec = require('cordova/exec'),
    NabtoError = require('./NabtoError'),
    NabtoConstants = require('./NabtoConstants');

function Nabto() {}

Nabto.prototype.startup = function(cb) {
  invokeNabto('startup', [], cb);
};

Nabto.prototype.setOption = function(name, value, cb) {
  invokeNabto('setOption', [name, value], cb);
};

Nabto.prototype.startupAndOpenProfile = function(user, pass, cb) {
  if (typeof user === 'function') {
    cb = user;
    user = null;
  }
  cb = cb || function() {};
  user = user || 'guest';
  pass = pass || '123456';
  invokeNabto('startupAndOpenProfile', [user, pass], cb);
};

Nabto.prototype.setStaticResourceDir = function(dir, cb) {
  if (typeof dir === 'string') {
    var prefix = 'file://';
    if (dir.substring(0, prefix.length) == prefix) {
      dir = dir.substring(prefix.length);
    }
  }
  invokeNabto('setStaticResourceDir', [dir], cb);
};

Nabto.prototype.setBasestationAuthJson = function(authJson, cb) {
  invokeNabto('setBasestationAuthJson', [authJson], cb);
};

Nabto.prototype.prepareInvoke = function(devices, cb) {
  invokeNabto('prepareInvoke', [devices], cb);
};

Nabto.prototype.createKeyPair = function(user, pass, cb) {
  invokeNabto('createKeyPair', [user, pass], cb);
};

Nabto.prototype.createSignedKeyPair = function(user, pass, cb) {
  invokeNabto('createSignedKeyPair', [user, pass], cb);
};

Nabto.prototype.signup = function(email, password, cb) {
  invokeNabto('signup', [email, password], cb);
};

Nabto.prototype.resetAccountPassword = function(email, cb) {
  invokeNabto('resetAccountPassword', [email], cb);
};

Nabto.prototype.removeKeyPair = function(user, cb) {
  invokeNabto('removeKeyPair', [user], cb);
};

Nabto.prototype.getFingerprint = function(user, cb) {
  invokeNabto('getFingerprint', [user], cb);
};

Nabto.prototype.shutdown = function(cb) {
  invokeNabto('shutdown', [], cb);
};

// requires prior invocation of setRpcInterface
Nabto.prototype.rpcInvoke = function(url, cb) {
  cb = cb || function() {};
  if (typeof url !== "string") {
    nextTick(cb, new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_INVALID_ARG));
    return;
  }
  exec(
    function success(result) {
      var obj, err;
      try {
        obj = JSON.parse(result);
      } catch (e) {
        err = new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_MALFORMED_JSON, result);
        cb(err, obj);
        return;
      }
      if (obj.response) {
        // ok
        err = undefined;
      } else if (obj.error) {
        err = new NabtoError(NabtoError.Category.P2P, undefined, result);
	obj = undefined;
      } else {
        err = new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_UNEXPECTED_DATA);
	obj = undefined;
      }
      cb(err, obj);
      return;
    },
    function error(error) {
      handlePotentialJsonError(cb, error);
    },
    'Nabto', 'rpcInvoke', [url]);
};

Nabto.prototype.rpcSetDefaultInterface = function(interfaceXml, cb) {
  invokeNabto('rpcSetDefaultInterface', [interfaceXml], cb);
};

Nabto.prototype.rpcSetInterface = function(host, interfaceXml, cb) {
  invokeNabto('rpcSetInterface', [host, interfaceXml], cb);
};

// STREAM API //
Nabto.prototype.streamOpen = function(host, cb) {
  if (!host || host.length == 0) {
    nextTick(cb, new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_INVALID_ARG));
    return;
  }
  invokeNabto('streamOpen', [host], cb);
};

Nabto.prototype.streamClose = function(stream, cb) {
  invokeNabto('streamClose', [stream], cb);
};

Nabto.prototype.streamConnectionType = function(stream, cb) {
  invokeNabto('streamConnectionType', [stream], cb);
};

Nabto.prototype.streamWrite = function(stream, data, cb) {
  var string = btoa(data);
  invokeNabto('streamWrite', [stream, string], cb);
};

Nabto.prototype.streamRead = function(stream, reqLen, cb) {
  exec(
    function success(result) {
      var string = atob(result);
      var len  = string.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++){
        bytes[i] = string.charCodeAt(i);
      }
      cb(undefined, bytes);
    },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', 'streamRead', [stream, reqLen]
  );
};

Nabto.prototype.tunnelOpenTcp = function(host, port, cb) {
  cb = cb || function() {};
  var portNum = parseInt(port, 10);
  if (!host || host.length == 0 || isNaN(portNum) || port < 0 || port > 65535) {
    nextTick(cb, new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_INVALID_ARG));
    return;
  }
  invokeNabto('tunnelOpenTcp', [host, port], cb);
};

Nabto.prototype.tunnelClose = function(tunnel, cb) {
  invokeNabto('tunnelClose', [tunnel], cb);
};

Nabto.prototype.tunnelPort = function(tunnel, cb) {
  invokeNabto('tunnelPort', [tunnel], cb);
};

Nabto.prototype.tunnelState = function(tunnel, cb) {
  invokeNabto('tunnelState', [tunnel], cb);
};


Nabto.prototype.getSessionToken = function(cb) {
  invokeNabto('getSessionToken', [], cb);
};

Nabto.prototype.getLocalDevices = function(cb) {
  invokeNabto('getLocalDevices', [], cb);
};

Nabto.prototype.version = function(cb) {
  invokeNabto('version', [], cb);
};

Nabto.prototype.versionString = function(cb) {
  invokeNabto('versionString', [], cb);
};

module.exports = new Nabto();

function rpcStyleInvoker(url, cb, apiFunction) {
};


function handlePotentialJsonError(cb, error) {
  var code; 
  var json;
  if (isNaN(parseInt(error))) {
    // json string (yirks ... use CDV messageAsMultipart to return explicit status + json string instead)
    code = NabtoConstants.ClientApiErrors.FAILED_WITH_JSON_MESSAGE;
    json = error;
  } else {
    code = error;
  }
  cb(new NabtoError(NabtoError.Category.API, code, json));
}

function nextTick(cb, arg) {
  // ensure all callbacks are invoked asynchronously (do not release zalgo (http://goo.gl/dP5Bbz))
  setTimeout(function() { cb(arg); }, 0);
//  cb(arg); /* good for debugging */
}

function invokeNabto(apiFunction, args, cb) {
  for (var i=0; i<args.length; i++) {
    if (typeof args[i] === 'function') {
      // missing argument
      nextTick(args[i], new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_INVALID_ARG));
      return;
    }    
  }
  cb = cb || function() {};
  exec(
    function success(result) {
      cb(undefined, result);
    },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', apiFunction, args
  );
}


