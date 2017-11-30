/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

var exec = require('cordova/exec'),
    NabtoError = require('./NabtoError'),
    NabtoConstants = require('./NabtoConstants');

function NabtoExp() {}

// STREAM API //
NabtoExp.prototype.streamOpen = function(host, cb) {
  if (!host || host.length == 0) {
    nextTick(cb, new NabtoError(NabtoError.Category.WRAPPER, NabtoError.Code.CDV_INVALID_ARG));
    return;
  }
  invokeNabto('streamOpen', [host], cb);
};

NabtoExp.prototype.streamClose = function(stream, cb) {
  invokeNabto('streamClose', [stream], cb);
};

NabtoExp.prototype.streamConnectionType = function(stream, cb) {
  invokeNabto('streamConnectionType', [stream], cb);
};

NabtoExp.prototype.streamWrite = function(stream, data, cb) {
  var string = btoa(data);
  invokeNabto('streamWrite', [stream, string], cb);
};

NabtoExp.prototype.streamRead = function(stream, reqLen, cb) {
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

module.exports = new NabtoExp();
