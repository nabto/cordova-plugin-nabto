/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

var exec = require('cordova/exec'),
  NabtoStatus = require('./NabtoStatus'),
  NabtoError = require('./NabtoError');

function Nabto() {}

Nabto.prototype.startup = function(user, pass, cb) {
  if (typeof user === 'function') {
    cb = user;
    user = null;
  }
  cb = cb || function() {};
  user = user || 'guest';
  pass = pass || '123456';

  exec(
    function() { cb(); },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'startup', [user, pass]);
};

Nabto.prototype.shutdown = function(cb) {
  cb = cb || function() {};

  exec(
    function() { cb(); },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'shutdown', []);
};

Nabto.prototype.fetchUrl = function(url, cb) {
  cb = cb || function() {};

  exec(
    function(result) {
      var obj, err;

      try {
        obj = JSON.parse(result);
      } catch (e) {
        err = new NabtoError(NabtoError.PARSE_ERROR);
      } finally {
        cb(err, obj);
      }
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'fetchUrl', [url]);
};

Nabto.prototype.getSessionToken = function(cb) {
  exec(
    function(token) {
      cb(undefined, token);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'getSessionToken', []);
};

Nabto.prototype.getLocalDevices = function(cb) {
  exec(
    function(devices) {
      cb(undefined, devices);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'getLocalDevices', []);
};

Nabto.prototype.version = function(cb) {
  exec(
    function(version) {
      cb(undefined, version);
    },
    function(status) {
      cb(new NabtoStatus(status));
    }, 'Nabto', 'version', []);
};

module.exports = new Nabto();
