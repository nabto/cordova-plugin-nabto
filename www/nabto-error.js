/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/*
 * Simplified wrapper for Nabto error handling at the 4 different
 * possible layers. The single error code attribute covers all layers
 * (categories):
 *
 * CDV_xxx error codes: An error occurred in the Cordova wrapper, for
 * instance invalid arguments were specified by the caller or an
 * unexpected response was received from the Nabto API (unlikely).
 *
 * API_xxx error codes: The low level Nabto API return codes
 * (e.g. API_NO_PROFILE) - most are not relevant for typical usage
 * from Cordova apps as the plugin ensures proper interaction with the
 * low level API.
 *
 * P2P_xxx error codes: These error codes mean that the interaction
 * with the low level Nabto API went ok - but anerror occurred when
 * invoking the remote Nabto device.
 *
 * EXC_xxx error codes: The communication with the remote device was
 * ok, but an application exception occurred on the device when
 * processing the request. For instance, insufficient access
 * privileges or an invalid operation was invoked.
 * 
 * err.code in { CDV_xxx, API_xxx, P2P_xxx, EXC_xxx }
 *
 * err.message - description of error
 *
 * err.inner = { // raw error
 *   "error" : {
 *     "body" : "The requested device is currently not online. Make sure the device is turned on and is connected to the network.",
 *     "detail" : "nabto://dddemo.nabto.net/wind_speed.json?",
 *     "event" : 1000015,
 *     "header" : "Device Unavailable (1000015)"
 *   }
 * }
 *
 * err.category in { WRAPPER, API, P2P, DEVICE_EXCEPTION }
 *
 */

var NabtoConstants = require('./NabtoConstants');

////////////////////////////////////////////////////////////////////////////////

NabtoError.Code = {};

// wrapper specific codes
NabtoError.Code.CDV_INVALID_ARG     =  1000;
NabtoError.Code.CDV_UNEXPECTED_DATA =  1001;
NabtoError.Code.CDV_MALFORMED_JSON  =  1002;

// relevant error codes mapped from nabto_client_api.h
NabtoError.Code.API_CERT_OPEN_FAIL              = 2001;
NabtoError.Code.API_NOT_INITIALIZED             = 2003;
NabtoError.Code.API_INVALID_SESSION             = 2004;
NabtoError.Code.API_UNLOCK_KEY_BAD_PASSWORD     = 2006;
NabtoError.Code.API_SERVER_LOGIN_FAILURE        = 2007;
NabtoError.Code.API_RPC_INTERFACE_NOT_SET       = 2027;
NabtoError.Code.API_RPC_NO_SUCH_REQUEST         = 2028;
NabtoError.Code.API_RPC_DEVICE_OFFLINE          = 2029;
NabtoError.Code.API_RPC_RESPONSE_DECODE_FAILURE = 2030;
NabtoError.Code.API_RPC_COMMUNICATION_PROBLEM   = 2031;
NabtoError.Code.API_CONNECT_TIMEOUT             = 2032;
NabtoError.Code.API_ERROR                       = 2100;

// relevant error codes mapped from nabto::Events
NabtoError.Code.P2P_ACCESS_DENIED_CONNECT    = 3111; // access denied for connection attempt
NabtoError.Code.P2P_DEVICE_OFFLINE           = 3115; // deprecated, for legacy clients only (rpc has specific offline error code above (2029))
NabtoError.Code.P2P_CONNECTION_PROBLEM       = 3116; 
NabtoError.Code.P2P_ENCRYPTION_MISMATCH      = 3120;
NabtoError.Code.P2P_DEVICE_BUSY              = 3121;
NabtoError.Code.P2P_DEVICE_REATTACHING       = 3124;
NabtoError.Code.P2P_CERT_CREATION_ERROR      = 3205;
NabtoError.Code.P2P_TIMEOUT                  = 3215; // TIME_OUT, CONNECT_TIMEOUT
NabtoError.Code.P2P_INTERFACE_DEF_INVALID    = 3223;
NabtoError.Code.P2P_NO_SUCH_REQUEST          = 3227; // NO_SUCH_REQ, FILE_NOT_FOUND
NabtoError.Code.P2P_PARAM_PARSE_ERROR        = 3229; 
NabtoError.Code.P2P_PARAM_MISSING            = 3230; 
NabtoError.Code.P2P_NO_NETWORK               = 3249;
NabtoError.Code.P2P_OTHER                    = 3999;

// device exceptions mapped from unabto/src/unabto/unabto_protocol_exceptions.h
NabtoError.Code.EXC_BASE             = 4000;
NabtoError.Code.EXC_NOT_READY        = 4003;
NabtoError.Code.EXC_NO_ACCESS        = 4004; // access denied for individual request
NabtoError.Code.EXC_TOO_SMALL        = 4005;
NabtoError.Code.EXC_TOO_LARGE        = 4006;
NabtoError.Code.EXC_INV_QUERY_ID     = 4007;
NabtoError.Code.EXC_RSP_TOO_LARGE    = 4008;
NabtoError.Code.EXC_OUT_OF_RESOURCES = 4009;
NabtoError.Code.EXC_SYSTEM_ERROR     = 4010;
NabtoError.Code.EXC_NO_QUERY_ID      = 4011;

////////////////////////////////////////////////////////////////////////////////

NabtoError.Message = {};
NabtoError.Message[NabtoError.Code.CDV_INVALID_ARG]           = "Invalid argument specified to Cordova wrapper";		    
NabtoError.Message[NabtoError.Code.CDV_UNEXPECTED_DATA]       = "Unexpected status data from SDK";		 NabtoError.Message[NabtoError.Code.CDV_MALFORMED_JSON]        = "SDK did not return valid JSON";

NabtoError.Message[NabtoError.Code.API_NOT_INITIALIZED]       = "API not initialized";
NabtoError.Message[NabtoError.Code.API_INVALID_SESSION]       = "Invalid Nabto session";
NabtoError.Message[NabtoError.Code.API_UNLOCK_KEY_BAD_PASSWORD] = "Private key could not be opened (decrypted) using specified password";
NabtoError.Message[NabtoError.Code.API_SERVER_LOGIN_FAILURE]  = "The specified username/password was not recognized by the certificate issuing server";
NabtoError.Message[NabtoError.Code.API_CERT_OPEN_FAIL]        = "Could not open certificate";		    
NabtoError.Message[NabtoError.Code.API_RPC_INTERFACE_NOT_SET] = "RPC interface not set prior to invoking";
NabtoError.Message[NabtoError.Code.API_RPC_NO_SUCH_REQUEST]   = "RPC interface does not define specified request";
NabtoError.Message[NabtoError.Code.API_RPC_DEVICE_OFFLINE]    = "Device is offline";
NabtoError.Message[NabtoError.Code.API_RPC_RESPONSE_DECODE_FAILURE] = "Could not decode response from device";
NabtoError.Message[NabtoError.Code.API_RPC_COMMUNICATION_PROBLEM] = "Error communicating with device";
NabtoError.Message[NabtoError.Code.API_CONNECT_TIMEOUT]       = "Timeout when connecting to device";
NabtoError.Message[NabtoError.Code.API_ERROR]                 = "An API error occurred";		    

NabtoError.Message[NabtoError.Code.P2P_INTERFACE_DEF_INVALID] = "Error parsing the RPC interface definition file (see log for details)";		    
NabtoError.Message[NabtoError.Code.P2P_ACCESS_DENIED_CONNECT] = "The remote device does not allow the current user to connect";		    
NabtoError.Message[NabtoError.Code.P2P_DEVICE_OFFLINE]        = "The remote device is not online";		    
NabtoError.Message[NabtoError.Code.P2P_DEVICE_BUSY]           = "The remote device cannot handle more connections at this moment";		    
NabtoError.Message[NabtoError.Code.P2P_NO_NETWORK]            = "This client does not have a network connection";		    
NabtoError.Message[NabtoError.Code.P2P_CONNECTION_PROBLEM]    = "A problem occurred when connecting to the remote device (could be due to high packet loss)";		    
NabtoError.Message[NabtoError.Code.P2P_ENCRYPTION_MISMATCH]   = "Security options of remote device does not match client's - likely because remote device is not using crypto";		    
NabtoError.Message[NabtoError.Code.P2P_DEVICE_REATTACHING]    = "Device is currently unavailable as it tries to reconnect to server, try again in a moment";
NabtoError.Message[NabtoError.Code.P2P_CERT_CREATION_ERROR]   = "Error creating certificate, if using guest certificate make sure it is pre-installed as a ressource (in share/nabto/users dir)";		    
NabtoError.Message[NabtoError.Code.P2P_TIMEOUT]               = "Timeout when trying to perform operation - likely due to a network or server problem";
NabtoError.Message[NabtoError.Code.P2P_NO_SUCH_REQUEST]       = "The specified request does not exist in the interface definition";
NabtoError.Message[NabtoError.Code.P2P_PARAM_PARSE_ERROR]     = "The parameter value could not be parsed according to the interface defintion";
NabtoError.Message[NabtoError.Code.P2P_PARAM_MISSING]         = "A parameter is missing for this request according to the interface definition";		    
NabtoError.Message[NabtoError.Code.P2P_OTHER]                 = "An error occurred - please consult log files for more information";
                                                                    
NabtoError.Message[NabtoError.Code.EXC_BASE]                  = "(n/a)";
NabtoError.Message[NabtoError.Code.EXC_NOT_READY]             = "Not ready: The remote application is not ready yet (still initializing)";
NabtoError.Message[NabtoError.Code.EXC_NO_ACCESS]             = "Access denied: The remote application does not allow this request to be answered";  // function level authorization failed 
NabtoError.Message[NabtoError.Code.EXC_TOO_SMALL]             = "The request is too small, i.e. required fields are not present";
NabtoError.Message[NabtoError.Code.EXC_TOO_LARGE]             = "The request is larger than expected";
NabtoError.Message[NabtoError.Code.EXC_INV_QUERY_ID]          = "Invalid query id: The remote application could not recognize the query id (opcode)";
NabtoError.Message[NabtoError.Code.EXC_RSP_TOO_LARGE]         = "Internal error in the remote application, response buffer too small";
NabtoError.Message[NabtoError.Code.EXC_OUT_OF_RESOURCES]      = "The remote device is out of resources (most likely out of memory)";
NabtoError.Message[NabtoError.Code.EXC_SYSTEM_ERROR]          = "Internal error in the remote application";
NabtoError.Message[NabtoError.Code.EXC_NO_QUERY_ID]           = "Query id (opcode) missing in request";


////////////////////////////////////////////////////////////////////////////////

NabtoError.Category = {};
NabtoError.Category.API              = 1;
NabtoError.Category.P2P              = 2;
NabtoError.Category.DEVICE_EXCEPTION = 3;
NabtoError.Category.WRAPPER          = 4;

////////////////////////////////////////////////////////////////////////////////


function NabtoError(category, status, innerError) {
  if (typeof(category) === "undefined") {
    throw new Error("Missing or invalid category");
  }
  this.initStatus(category, status, innerError);
  
  this.__defineGetter__('value', function() {
    return this.code;
  });

  this.__defineGetter__('message', function() {
    var msg = this.lookupMessage(this.code);
    if (!msg) {
      msg = `Code ${this.toString()} (${this.code}), Category ${this.category}, inner: ${this.inner}`;
    }
    return msg;
  });

}

NabtoError.prototype.initStatus = function(category, status, doc) {
  switch (category) {
  case NabtoError.Category.API:     this.handleApiError(status); break;
  case NabtoError.Category.P2P:     this.handleP2pError(status, doc); break;
  case NabtoError.Category.WRAPPER: this.handleWrapperError(status); break;
  default:
    throw new Error("Invalid category: " + category);
  }
};

NabtoError.prototype.lookupMessage = function(code) {
  return NabtoError.Message[code];
};

NabtoError.prototype.handleApiError = function(status) {
  this.inner = status;
  this.category = NabtoError.Category.API;
  
  switch (status) {
    
  case NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED:
    this.code = NabtoError.Code.API_NOT_INITIALIZED;
    break;
    
  case NabtoConstants.ClientApiErrors.INVALID_SESSION:
    this.code = NabtoError.Code.API_INVALID_SESSION;
    break;

  case NabtoConstants.ClientApiErrors.UNLOCK_PK_FAILED:
    this.code = NabtoError.Code.API_UNLOCK_KEY_BAD_PASSWORD;
    break;

  case NabtoConstants.ClientApiErrors.PORTAL_LOGIN_FAILURE:
    this.code = NabtoError.Code.API_SERVER_LOGIN_FAILURE;
    break;

  case NabtoConstants.ClientApiErrors.OPEN_CERT_OR_PK_FAILED:
  case NabtoConstants.ClientApiErrors.NO_PROFILE:
    this.code = NabtoError.Code.API_CERT_OPEN_FAIL;
    break;

  case NabtoConstants.ClientApiErrors.RPC_INTERFACE_NOT_SET:
    this.code = NabtoError.Code.API_RPC_INTERFACE_NOT_SET;
    break;

  case NabtoConstants.ClientApiErrors.RPC_NO_SUCH_REQUEST:
    this.code = NabtoError.Code.API_RPC_NO_SUCH_REQUEST;
    break;

  case NabtoConstants.ClientApiErrors.RPC_DEVICE_OFFLINE:
    this.code = NabtoError.Code.API_RPC_DEVICE_OFFLINE;
    break;

  case NabtoConstants.ClientApiErrors.RPC_RESPONSE_DECODE_FAILURE:
    this.code = NabtoError.Code.API_RPC_RESPONSE_DECODE_FAILURE;
    break;

  case NabtoConstants.ClientApiErrors.RPC_COMMUNICATION_PROBLEM:
    this.code = NabtoError.Code.API_RPC_COMMUNICATION_PROBLEM;
    break;

  case NabtoConstants.ClientApiErrors.CONNECT_TIMEOUT:
    this.code = NabtoError.Code.API_CONNECT_TIMEOUT;
    break;

  case NabtoConstants.ClientApiErrors.FAILED:
    this.code = NabtoError.Code.API_ERROR;
    break;

  defau1t:
    console.log(`Unexpected API status ${status}`);
    this.code = NabtoError.Code.API_ERROR;
    break;
  }
};

/* Handle output of the following form to an appropriate NabtoError:
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
NabtoError.prototype.handleP2pError = function(status, obj) {
  if (typeof(status) === 'number' && typeof(obj) === 'undefined') {
    // a few functions inject a Nabto event code directly instead of through an error document
    this.handleNabtoEvent(status);
    return;
  }
  var error = obj.error;
  this.inner = error;
  if (!(error && error.event)) {
    this.handleUnexpectedObject(obj);
  } else {
    if (error.event == NabtoConstants.ClientEvents.UNABTO_APPLICATION_EXCEPTION) {
      this.handleDeviceException(error);
    } else {
      this.handleNabtoEvent(error.event);
    }
  }
};

NabtoError.prototype.handleWrapperError = function(status) {
  this.code = status;
  this.category = NabtoError.Category.WRAPPER;
};

NabtoError.prototype.handleDeviceException = function(error) {
  // unabto/src/unabto/unabto_protocol_exceptions.h
  try {
    if (!error.detail) {
      throw "Unexpected error object: " + error;
    }
    this.code = this.mapExceptionStringToCode(error.detail);
    this.category = NabtoError.Category.DEVICE_EXCEPTION;
    this.inner = error;
  } catch (e) {
    this.handleUnexpectedObject(error);
  }
};

NabtoError.prototype.mapExceptionStringToCode = function(exception) {
  var prefix = "NP_E_";
  var s = exception.substring(prefix.length);
  if (NabtoConstants.DeviceExceptions.hasOwnProperty(s)) {
    return NabtoError.Code.EXC_BASE + NabtoConstants.DeviceExceptions[s];
  } else {
    throw "Unexpected device exception code: " + s;
  }
};

NabtoError.prototype.handleNabtoEvent = function(event) {
  switch (event) {

  case NabtoConstants.ClientEvents.ACCESS_DENIED:
    this.code = NabtoError.Code.P2P_ACCESS_DENIED_CONNECT;
    break;

  case NabtoConstants.ClientEvents.MICROSERVER_NOT_KNOWN:
    this.code = NabtoError.Code.P2P_DEVICE_OFFLINE;
    break;

  case NabtoConstants.ClientEvents.CONNECTION_PROBLEM:
    this.code = NabtoError.Code.P2P_CONNECTION_PROBLEM;
    break;
        
  case NabtoConstants.ClientEvents.ENCRYPTION_MISMATCH:
    this.code = NabtoError.Code.P2P_ENCRYPTION_MISMATCH;
    break;

  case NabtoConstants.ClientEvents.MICROSERVER_BUSY:
    this.code = NabtoError.Code.P2P_DEVICE_BUSY;
    break;

  case NabtoConstants.ClientEvents.MICROSERVER_REATTACHING:
    this.code = NabtoError.Code.P2P_DEVICE_REATTACHING;
    break;
        
  case NabtoConstants.ClientEvents.CERT_CREATION_ERROR:
    this.code = NabtoError.Code.P2P_CERT_CREATION_ERROR;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_PARSE_ERROR:
    this.code = NabtoError.Code.P2P_INTERFACE_DEF_INVALID;
    break;

  case NabtoConstants.ClientEvents.TIME_OUT:
  case NabtoConstants.ClientEvents.CONNECT_TIMEOUT:
    this.code = NabtoError.Code.P2P_TIMEOUT;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_NO_SUCH_REQUEST:
  case NabtoConstants.ClientEvents.FILE_NOT_FOUND:
    this.code = NabtoError.Code.P2P_NO_SUCH_REQUEST;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_PARAMETER_PARSE_ERROR:
    this.code = NabtoError.Code.P2P_PARAM_PARSE_ERROR;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_MISSING_PARAMETER:
    this.code = NabtoError.Code.P2P_PARAM_MISSING;
    break;

  case NabtoConstants.ClientEvents.NO_NETWORK:
  case NabtoConstants.ClientEvents.NO_INTERNET_ACCESS:
    this.code = NabtoError.Code.P2P_NO_NETWORK;
    break;
                
  default:    
    this.code = NabtoError.Code.P2P_OTHER;
    break;
  }

  this.category = NabtoError.Category.P2P;
};

NabtoError.prototype.handleUnexpected = function(inner) {
  this.category = NabtoError.Category.WRAPPER;
  this.code = NabtoError.Code.CDV_UNEXPECTED_DATA;
  this.inner = inner;
};

NabtoError.prototype.handleUnexpectedObject = function(obj) {
  var inner;
  try {
    var json = JSON.stringify(obj);
    inner = `Unexpected object: ${json}`; 
  } catch (e) {
    inner = "Invalid JSON response"; 
  }
  return this.handleUnexpected(inner);
};

NabtoError.prototype.toString = function() {
  for (var prop in NabtoError.Code) {
    if (NabtoError.Code.hasOwnProperty(prop)) {
      if (NabtoError.Code[prop] === this.code) {
        return prop;
      } 
    }
  }
  return 'UNKNOWN';
};

module.exports = NabtoError;
