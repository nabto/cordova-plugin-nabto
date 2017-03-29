/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

var exec = require('cordova/exec'),
    NabtoError = require('./NabtoError'),
    NabtoConstants = require('./NabtoConstants');

function Nabto() {}

function nextTick(cb, arg) {
  // ensure all callbacks are invoked asynchronously (do not release zalgo (http://goo.gl/dP5Bbz))
  setTimeout(function() { cb(arg); }, 0);
//  cb(arg); /* good for debugging */
}

Nabto.prototype.startup = function(cb) {
  cb = cb || function() {};
  exec(
    function success() { cb(); },
    function error(apiStatus) {cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', 'startup', []);
};

Nabto.prototype.setOption = function(name, value, cb) {
  cb = cb || function() {};
  exec(
    function success() {
      cb();
    },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', 'setOption', [name, value]);
};

Nabto.prototype.startupAndOpenProfile = function(user, pass, cb) {
  if (typeof user === 'function') {
    cb = user;
    user = null;
  }
  cb = cb || function() {};
  user = user || 'guest';
  pass = pass || '123456';

  exec(
    function success() { cb(); },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', 'startupAndOpenProfile', [user, pass]);
};

Nabto.prototype.prepareInvoke = function(devices, cb) {
  cb = cb || function(){};
  exec(
    function success(){
      cb();
    },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', 'prepareInvoke',[devices]);
};

function generalCreateKeyPair(user, pass, cb, apiFunction) {
  cb = cb || function() {};
  exec(
    function success() {
      cb();
    },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', apiFunction, [user, pass]
  );
};

Nabto.prototype.createKeyPair = function(user, pass, cb) {
  return generalCreateKeyPair(user, pass, cb, 'createKeyPair');
};

Nabto.prototype.createSignedKeyPair = function(user, pass, cb) {
  return generalCreateKeyPair(user, pass, cb, 'createSignedKeyPair');
};

Nabto.prototype.getFingerprint = function(email, cb) {
  cb = cb || function() {};
  exec(
    function success(fingerprint) { cb(undefined, fingerprint); },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    },
    'Nabto', 'getFingerprint', [email]
  );
};

Nabto.prototype.shutdown = function(cb) {
  cb = cb || function() {};

  exec(
    function success() { cb(); },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    }, 
    'Nabto', 'shutdown', []);
};

function rpcStyleInvoker(url, cb, apiFunction) {
  cb = cb || function() {};
  if (typeof url !== "string") {
    return nextTick(cb, new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_INVALID_ARG));
  }
  exec(
    function success(result) {
      var obj, err;
      try {
        obj = JSON.parse(result);
      } catch (e) {
        err = new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_MALFORMED_JSON, result);
        return cb(err, obj);
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
      return cb(err, obj);       
    },
    function error(error) {
      handlePotentialJsonError(cb, error);
    },
    'Nabto', apiFunction, [url]);
};

// requires prior invocation of setRpcInterface
Nabto.prototype.rpcInvoke = function(url, cb) {
  return rpcStyleInvoker(url, cb, 'rpcInvoke');
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

Nabto.prototype.rpcSetDefaultInterface = function(interfaceXml, cb) {
  cb = cb || function() {};
  exec(
    function success() {
      cb(undefined);
    },
    function error(err) {
      handlePotentialJsonError(cb, err);
    }, 'Nabto', 'rpcSetDefaultInterface', [interfaceXml]);
};

Nabto.prototype.rpcSetInterface = function(host, interfaceXml, cb) {
  cb = cb || function() {};
  exec(
    function success() {
      cb(undefined);
    },
    function error(err) {
      handlePotentialJsonError(cb, err);
    }, 'Nabto', 'rpcSetInterface', [host, interfaceXml]);
};

Nabto.prototype.getSessionToken = function(cb) {
  cb = cb || function() {};

  exec(
    function success(token) {
      cb(undefined, token);
    },
    function error(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    }, 'Nabto', 'getSessionToken', []);
};

Nabto.prototype.getLocalDevices = function(cb) {
  cb = cb || function() {};

  exec(
    function(devices) {
      cb(undefined, devices);
    },
    function(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    }, 'Nabto', 'getLocalDevices', []);
};

Nabto.prototype.version = function(cb) {
  cb = cb || function() {};

  exec(
    function(version) {
      cb(undefined, version);
    },
    function(apiStatus) {
      cb(new NabtoError(NabtoError.Category.API, apiStatus));
    }, 'Nabto', 'version', []);
};

module.exports = new Nabto();
