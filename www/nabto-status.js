/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

/*
 * nabto.invokeRpc(url, cb)
 *
 * cb(err, data)
 *
 * err.code in { API_xxx, P2P_xxx, EXC_xxx, CDV_xxx }
 *
 * err.category in { API, P2P, DEVICE_EXCEPTION, WRAPPER }
 *
 * err.inner = {
 *   "error" : {
 *     "body" : "The requested device is currently not online. Make sure the device is turned on and is connected to the network.",
 *     "detail" : "nabto://dddemo.nabto.net/wind_speed.json?",
 *     "event" : 1000015,
 *     "header" : "Device Unavailable (1000015)"
 *   }
 * }
 *
 *
 * API_xxx error codes: The low level Nabto API return codes
 * (e.g. API_NO_PROFILE) - most are not relevant for typical usage
 * from Cordova apps as the plugin ensures proper interaction with the
 * low level API.
 *
 * P2P_xxx error codes: These error codes mean that the interaction
 * with the low level Nabto API went ok - but an error occurred when
 * invoking the Nabto device, for instance the device is not online.
 *
 * EXC_xxx error codes: The communication with the remote device was
 * ok, but an application exception occurred on the device when
 * processing the request. For instance, insufficient access
 * privileges or an invalid operation was invoked.
 * 
 * CDV_xxx error codes: An error occurred in the Cordova wrapper, for
 * instance invalid arguments were specified by the caller or an
 * unexpected response was received from the Nabto API (unlikely).
 */

var NabtoConstants = require('./NabtoConstants');

function NabtoStatus(category, status, innerError) {
  if (typeof(category) === "undefined") {
    throw new Error("Missing or invalid category");
  }
  this.initStatus(category, status, innerError);
  
  this.__defineGetter__('value', function() {
    return this.code;
  });

}

NabtoStatus.prototype.initStatus = function(category, status, innerError) {
  switch (category) {
  case NabtoStatus.Category.API:     this.handleApiError(status); break;
  case NabtoStatus.Category.P2P:     this.handleP2pError(innerError); break;
  case NabtoStatus.Category.WRAPPER: this.handleWrapperError(status); break;
  default:
    throw new Error("Invalid category: " + category);
  }
};

NabtoStatus.prototype.handleApiError = function(status) {
  if (status > NabtoConstants.ClientApiErrors.INVALID_STREAM_OPTION_ARGUMENT) {
    return this.handleUnexpected(`Unexpected API status [${status}]`);
  }

  this.inner = status;
  this.category = NabtoStatus.Category.API;

  switch (status) {
    
  case NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED:
    this.message = "API not initialized";
    this.code = NabtoStatus.Code.API_NOT_INITIALIZED;
    break;
    
  case NabtoConstants.ClientApiErrors.INVALID_SESSION:
    this.message = "Invalid Nabto session";
    this.code = NabtoStatus.Code.API_INVALID_SESSION;
    break;
    
  case NabtoConstants.ClientApiErrors.OPEN_CERT_OR_PK_FAILED:
  case NabtoConstants.ClientApiErrors.UNLOCK_PK_FAILED:
  case NabtoConstants.ClientApiErrors.NO_PROFILE:
    this.message = "Could not open certificate";
    this.code = NabtoStatus.Code.API_CERT_OPEN_FAIL;
    break;
    
  default:
    this.message = "An API error occurred";
    this.code = NabtoStatus.Code.API_ERROR;
    break;
  }
};

/* Handle output of the following form to an appropriate NabtoStatus:
 *   "error" : {
 *     "body" : "The requested device is currently not online. Make sure the device is turned on and is connected to the network.",
 *     "detail" : "nabto://offline.nabto.net/wind_speed.json?",
 *     "event" : 1000015,
 *     "header" : "Device Unavailable (1000015)"
 *   }
 *
* and
* 
*    "error": {
*        "event": "2000065",
*        "header": "Error in device application (2000065)",
*        "detail": "NP_E_INV_QUERY_ID",
*        "body": "Communication with the device succeeded, but the application on the device returned error code NP_E_INV_QUERY_ID"
*    }
 */
NabtoStatus.prototype.handleP2pError = function(obj) {
  var error = obj.error;
  if (!(error && error.event)) {
    this.handleUnexpectedObject(obj);
  } else {
    if (error.event == NabtoConstants.ClientEvents.UNABTO_APPLICATION_EXCEPTION) {
      this.handleDeviceException(error.detail);
    } else {
      this.handleNabtoEvent(error);
    }
    this.inner = obj;
  }
};

NabtoStatus.prototype.handleWrapperError = function(status) {
};

NabtoStatus.prototype.handleDeviceException = function(deviceException) {
  // unabto/src/unabto/unabto_protocol_exceptions.h
  var deviceExceptionCode = mapExceptionStringToCode(...);
  var message = lookupDeviceMessage(deviceExceptionCode);
  // TODO - set message
  
};

NabtoStatus.prototype.handleNabtoEvent = function(obj) {
  switch (obj.event) {

  case NabtoConstants.ClientEvents.MICROSERVER_NOT_KNOWN:
    this.code = NabtoStatus.Code.P2P_DEVICE_OFFLINE;
    break;

  case NabtoConstants.ClientEvents.QUERY_MODEL_PARSE_ERROR:
    this.code = NabtoStatus.Code.P2P_INVALID_MODEL;
    break;

  default:
    this.code = NabtoStatus.Code.P2P_ERROR;
    break;
  }

  this.message = obj.body;
  this.category = NabtoStatus.Category.P2P;

};

NabtoStatus.prototype.handleUnexpected = function(message) {
  this.category = NabtoStatus.Category.WRAPPER;
  this.code = NabtoStatus.Code.CDV_UNEXPECTED_DATA;
  this.message = message;
};

NabtoStatus.prototype.handleUnexpectedObject = function(obj) {
  var message;
  try {
    var json = JSON.stringify(obj);
    message = `Unexpected object: ${json}`;
  } catch (e) {
    message = "Invalid JSON response";
  }
  return this.handleUnexpected(message);
};


NabtoStatus.prototype.getStatus = function() {
  return this.code;
};

NabtoStatus.prototype.toString = function() {
  for (var prop in NabtoStatus.Code) {
    if (NabtoStatus.Code.hasOwnProperty(prop)) {
      if (NabtoStatus.Code[prop] === this.code) {
        return prop;
      } 
    }
  }
  return 'UNKNOWN';
};

////////////////////////////////////////////////////////////////////////////////

NabtoStatus.Code = {};

// relevant error codes mapped from nabto_client_api.h
NabtoStatus.Code.API_NOT_INITIALIZED  = 1003;
NabtoStatus.Code.API_INVALID_SESSION  = 1004;
NabtoStatus.Code.API_CERT_OPEN_FAIL   = 1005;
NabtoStatus.Code.API_ERROR            = 1100;

// relevant error codes mapped from nabto::Events
NabtoStatus.Code.P2P_INVALID_MODEL    = 2223;
NabtoStatus.Code.P2P_DEVICE_OFFLINE   = 2115;
NabtoStatus.Code.P2P_NO_NETWORK       = 2249;

// device exceptions mapped from unabto/src/unabto/unabto_protocol_exceptions.h
NabtoStatus.Code.EXC_BASE             = 3000;
NabtoStatus.Code.EXC_NOT_READY        = 3003;
NabtoStatus.Code.EXC_NO_ACCESS        = 3004;
NabtoStatus.Code.EXC_TOO_SMALL        = 3005;
NabtoStatus.Code.EXC_TOO_LARGE        = 3006;
NabtoStatus.Code.EXC_INV_QUERY_ID     = 3007;
NabtoStatus.Code.EXC_RSP_TOO_LARGE    = 3008;
NabtoStatus.Code.EXC_OUT_OF_RESOURCES = 3009;
NabtoStatus.Code.EXC_SYSTEM_ERROR     = 3010;
NabtoStatus.Code.EXC_NO_QUERY_ID      = 3011;

// wrapper specific codes
NabtoStatus.Code.CDV_INVALID_ARG     =  4000;
NabtoStatus.Code.CDV_UNEXPECTED_DATA =  4001;

////////////////////////////////////////////////////////////////////////////////

NabtoStatus.Category = {};
NabtoStatus.Category.API              = 1;
NabtoStatus.Category.P2P              = 2;
NabtoStatus.Category.DEVICE_EXCEPTION = 3;
NabtoStatus.Category.WRAPPER          = 4;

////////////////////////////////////////////////////////////////////////////////

module.exports = NabtoStatus;
