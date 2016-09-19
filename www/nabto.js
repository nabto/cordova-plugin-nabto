/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

var exec = require('cordova/exec'),
    NabtoStatus = require('./NabtoStatus'),
    NabtoError = require('./NabtoError'),
    NabtoTunnelState = require('./NabtoTunnelState');

function Nabto() {}

function nextTick(cb, arg) {
  // ensure all callbacks are invoked asynchronously (do not release zalgo (http://goo.gl/dP5Bbz))
  setTimeout(function() { cb(arg); }, 0);
//  cb(arg); /* good for debugging */
}

Nabto.prototype.startup = function(user, pass, cb) {
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
      cb(new NabtoStatus(NabtoStatus.Category.API, apiStatus));
    },
    'Nabto', 'startup', [user, pass]);
};

Nabto.prototype.shutdown = function(cb) {
  cb = cb || function() {};

  exec(
    function success() { cb(); },
    function error(apiStatus) {
      cb(new NabtoStatus(NabtoStatus.Category.API, apiStatus));
    }, 
    'Nabto', 'shutdown', []);
};

Nabto.prototype.fetchUrl = function(url, cb) {
  cb = cb || function() {};
  if (typeof url !== "string") {
    return nextTick(cb, new NabtoStatus(NabtoStatus.Category.WRAPPER, NabtoStatus.Code.CDV_INVALID_ARG));
  }

  exec(
    function success(result) {
      var obj, err;
      try {
        obj = JSON.parse(result);
      } catch (e) {
        err = new NabtoStatus(NabtoStatus.Category.WRAPPER, NabtoStatus.Code.CDV_UNEXPECTED_DATA, e);
        return cb(err, obj);
      }
      if (obj.response) {
        // ok
        err = undefined;
      } else if (obj.error) {
        err = new NabtoStatus(NabtoStatus.Category.P2P, undefined, obj);
	obj = undefined;
      } else {
        err = new NabtoStatus(NabtoStatus.Category.WRAPPER, NabtoStatus.Code.CDV_UNEXPECTED_DATA);
	obj = undefined;
      }
      return cb(err, obj);       
    },
    function error(apiStatus) {
      cb(new NabtoStatus(NabtoStatus.Category.API, apiStatus));
    },
    'Nabto', 'fetchUrl', [url]);
};

Nabto.prototype.getSessionToken = function(cb) {
  cb = cb || function() {};

  exec(
    function(token) {
      cb(undefined, token);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'getSessionToken', []);
};

Nabto.prototype.getLocalDevices = function(cb) {
  cb = cb || function() {};

  exec(
    function(devices) {
      cb(undefined, devices);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'getLocalDevices', []);
};

Nabto.prototype.version = function(cb) {
  cb = cb || function() {};

  exec(
    function(version) {
      cb(undefined, version);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'version', []);
};

Nabto.prototype.tunnelOpenTcp = function(host, port, cb) {
  cb = cb || function() {};
  if (typeof host !== 'string' || typeof port !== 'number') {
    if (typeof host === 'function') {
      cb = host;
    }
    return cb(new NabtoError(NabtoError.INVALID_ARG));
  }

  exec(
    function() { cb(); },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'tunnelOpenTcp', [host, port]);
};

Nabto.prototype.tunnelVersion = function(cb) {
  cb = cb || function() {};

  exec(
    function(version) {
      cb(undefined, version);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'tunnelVersion', []);
};

Nabto.prototype.tunnelState = function(cb) {
  cb = cb || function() {};

  exec(
    function(state) {
      cb(undefined, new NabtoTunnelState(state));
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'tunnelState', []);
};

Nabto.prototype.tunnelLastError = function(cb) {
  cb = cb || function() {};

  exec(
    function(status) {
      cb(new NabtoStatus(status));
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'tunnelLastError', []);
};

Nabto.prototype.tunnelPort = function(cb) {
  cb = cb || function() {};

  exec(
    function(port) {
      cb(undefined, port);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'tunnelPort', []);
};

Nabto.prototype.tunnelClose = function(cb) {
  cb = cb || function() {};

  exec(
    function() { cb(); },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'tunnelClose', []);
};

module.exports = new Nabto();
