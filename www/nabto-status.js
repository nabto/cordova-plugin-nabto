/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

function NabtoStatus(status) {
  this.status = status || NabtoStatus.OK;
  if (this.status > NabtoStatus.INVALID_STREAM_OPTION_ARGUMENT) {
    this.status = NabtoStatus.UNKNOWN;
  }

  this.__defineGetter__('value', function() {
    return this.status;
  });
}

NabtoStatus.prototype.getStatus = function() {
  return this.status;
};

NabtoStatus.prototype.toString = function() {
  for (var prop in NabtoStatus) {
    if (NabtoStatus.hasOwnProperty(prop)) {
      if (NabtoStatus[prop] === this.status) {
        return prop;
      }
    }
  }
  return 'UNKNOWN';
};

NabtoStatus.UNKNOWN = -1;
NabtoStatus.OK = 0;
NabtoStatus.NO_PROFILE = 1;
NabtoStatus.ERROR_READING_CONFIG = 2;
NabtoStatus.API_NOT_INITIALIZED = 3;
NabtoStatus.INVALID_SESSION = 4;
NabtoStatus.OPEN_CERT_OR_PK_FAILED = 5;
NabtoStatus.UNLOCK_PK_FAILED = 6;
NabtoStatus.PORTAL_LOGIN_FAILURE = 7;
NabtoStatus.CERT_SIGNING_ERROR = 8;
NabtoStatus.CERT_SAVING_FAILURE = 9;
NabtoStatus.ADDRESS_IN_USE = 10;
NabtoStatus.INVALID_ADDRESS = 11;
NabtoStatus.NO_NETWORK = 12;
NabtoStatus.CONNECT_TO_HOST_FAILED = 13;
NabtoStatus.STREAMING_UNSUPPORTED = 14;
NabtoStatus.INVALID_STREAM = 15;
NabtoStatus.DATA_PENDING = 16;
NabtoStatus.BUFFER_FULL = 17;
NabtoStatus.FAILED = 18;
NabtoStatus.INVALID_TUNNEL = 19;
NabtoStatus.ILLEGAL_PARAMETER = 20;
NabtoStatus.INVALID_RESOURCE = 21;
NabtoStatus.INVALID_STREAM_OPTION = 22;
NabtoStatus.INVALID_STREAM_OPTION_ARGUMENT = 23;

module.exports = NabtoStatus;
