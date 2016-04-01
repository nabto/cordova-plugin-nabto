/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

function NabtoError(error) {
  this.error = error || NabtoError.OK;
  if (this.error > NabtoError.INVALID_ARG) {
    this.error = NabtoError.UNKNOWN;
  }

  this.__defineGetter__('value', function() {
    return this.error;
  });
}

NabtoError.prototype.getError = function() {
  return this.error;
};

NabtoError.prototype.toString = function() {
  for (var prop in NabtoError) {
    if (NabtoError.hasOwnProperty(prop)) {
      if (NabtoError[prop] === this.error) {
        return prop;
      }
    }
  }
  return 'UNKNOWN';
};

NabtoError.UNKNOWN = -1;
NabtoError.OK = 0;
NabtoError.PARSE_ERROR = 1;
NabtoError.INVALID_ARG = 2;

module.exports = NabtoError;
