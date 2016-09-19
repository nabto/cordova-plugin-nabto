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
 * with the low level Nabto API went ok - but an error occurred when
 * invoking the remote Nabto device, for instance the device is not
 * online.
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

NabtoStatus.Code = {};

// wrapper specific codes
NabtoStatus.Code.CDV_INVALID_ARG     =  1000;
NabtoStatus.Code.CDV_UNEXPECTED_DATA =  1001;

// relevant error codes mapped from nabto_client_api.h
NabtoStatus.Code.API_CERT_OPEN_FAIL          = 2001;
NabtoStatus.Code.API_NOT_INITIALIZED         = 2003;
NabtoStatus.Code.API_INVALID_SESSION         = 2004;
NabtoStatus.Code.API_UNLOCK_KEY_BAD_PASSWORD = 2006;
NabtoStatus.Code.API_SERVER_LOGIN_FAILURE    = 2007;
NabtoStatus.Code.API_ERROR                   = 2100;

// relevant error codes mapped from nabto::Events
NabtoStatus.Code.P2P_ACCESS_DENIED_CONNECT    = 3111; // access denied for connection attempt
NabtoStatus.Code.P2P_DEVICE_OFFLINE           = 3115;
NabtoStatus.Code.P2P_CONNECTION_PROBLEM       = 3116; 
NabtoStatus.Code.P2P_ENCRYPTION_MISMATCH      = 3120;
NabtoStatus.Code.P2P_DEVICE_BUSY              = 3121;
NabtoStatus.Code.P2P_DEVICE_REATTACHING       = 3124;
NabtoStatus.Code.P2P_CERT_CREATION_ERROR      = 3205;
NabtoStatus.Code.P2P_TIMEOUT                  = 3215; // TIME_OUT, CONNECT_TIMEOUT
NabtoStatus.Code.P2P_INTERFACE_DEF_INVALID    = 3223;
NabtoStatus.Code.P2P_NO_SUCH_REQUEST          = 3227; // NO_SUCH_REQ, FILE_NOT_FOUND
NabtoStatus.Code.P2P_PARAM_PARSE_ERROR        = 3229; 
NabtoStatus.Code.P2P_PARAM_MISSING            = 3230; 
NabtoStatus.Code.P2P_NO_NETWORK               = 3249;
NabtoStatus.Code.P2P_OTHER                    = 3999;

// device exceptions mapped from unabto/src/unabto/unabto_protocol_exceptions.h
NabtoStatus.Code.EXC_BASE             = 4000;
NabtoStatus.Code.EXC_NOT_READY        = 4003;
NabtoStatus.Code.EXC_NO_ACCESS        = 4004; // access denied for individual request
NabtoStatus.Code.EXC_TOO_SMALL        = 4005;
NabtoStatus.Code.EXC_TOO_LARGE        = 4006;
NabtoStatus.Code.EXC_INV_QUERY_ID     = 4007;
NabtoStatus.Code.EXC_RSP_TOO_LARGE    = 4008;
NabtoStatus.Code.EXC_OUT_OF_RESOURCES = 4009;
NabtoStatus.Code.EXC_SYSTEM_ERROR     = 4010;
NabtoStatus.Code.EXC_NO_QUERY_ID      = 4011;

////////////////////////////////////////////////////////////////////////////////

NabtoStatus.Message = {};
NabtoStatus.Message[NabtoStatus.Code.CDV_INVALID_ARG]           = "Invalid argument specified to Cordova wrapper";		    
NabtoStatus.Message[NabtoStatus.Code.CDV_UNEXPECTED_DATA]       = "Unexpected status data from SDK";		    

NabtoStatus.Message[NabtoStatus.Code.API_NOT_INITIALIZED]       = "API not initialized";
NabtoStatus.Message[NabtoStatus.Code.API_INVALID_SESSION]       = "Invalid Nabto session";
NabtoStatus.Message[NabtoStatus.Code.API_CERT_OPEN_FAIL]        = "Could not open certificate";		    
NabtoStatus.Message[NabtoStatus.Code.API_ERROR]                 = "An API error occurred";		    

NabtoStatus.Message[NabtoStatus.Code.P2P_INTERFACE_DEF_INVALID] = "Error parsing the RPC interface definition file (see log for details)";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_ACCESS_DENIED_CONNECT] = "The remote device does not allow the current user to connect";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_DEVICE_OFFLINE]        = "The remote device is not online";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_DEVICE_BUSY]           = "The remote device cannot handle more connections at this moment";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_NO_NETWORK]            = "This client does not have a network connection";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_CONNECTION_PROBLEM]    = "A problem occurred when connecting to the remote device (could be due to high packet loss)";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_ENCRYPTION_MISMATCH]   = "Security options of remote device does not match client's - likely because remote device is not using crypto";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_DEVICE_REATTACHING]    = "Device is currently unavailable as it tries to reconnect to server, try again in a moment";
NabtoStatus.Message[NabtoStatus.Code.P2P_CERT_CREATION_ERROR]   = "Error creating certificate, if using guest certificate make sure it is pre-installed as a ressource (in share/nabto/users dir)";		    
NabtoStatus.Message[NabtoStatus.Code.P2P_TIMEOUT]               = "Timeout when trying to perform operation - likely due to a network or server problem";
NabtoStatus.Message[NabtoStatus.Code.P2P_NO_SUCH_REQUEST]       = "The specified request does not exist in the interface definition";
NabtoStatus.Message[NabtoStatus.Code.P2P_PARAM_PARSE_ERROR]     = "The parameter value could not be parsed according to the interface defintion";
NabtoStatus.Message[NabtoStatus.Code.P2P_PARAM_MISSING]         = "A parameter is missing for this request according to the interface definition";		    
                                                                    
NabtoStatus.Message[NabtoStatus.Code.EXC_NOT_READY]             = "Not ready: The remote application is not ready yet (still initializing)";
NabtoStatus.Message[NabtoStatus.Code.EXC_NO_ACCESS]             = "Access denied: The remote application does not allow this request to be answered";  // function level authorization failed 
NabtoStatus.Message[NabtoStatus.Code.EXC_TOO_SMALL]             = "The request is too small, i.e. required fields are not present";
NabtoStatus.Message[NabtoStatus.Code.EXC_TOO_LARGE]             = "The request is larger than expected";
NabtoStatus.Message[NabtoStatus.Code.EXC_INV_QUERY_ID]          = "Invalid query id: The remote application could not recognize the query id (opcode)";
NabtoStatus.Message[NabtoStatus.Code.EXC_RSP_TOO_LARGE]         = "Internal error in the remote application, response buffer too small";
NabtoStatus.Message[NabtoStatus.Code.EXC_OUT_OF_RESOURCES]      = "The remote device is out of resources (most likely out of memory)";
NabtoStatus.Message[NabtoStatus.Code.EXC_SYSTEM_ERROR]          = "Internal error in the remote application";
NabtoStatus.Message[NabtoStatus.Code.EXC_NO_QUERY_ID]           = "Query id (opcode) missing in request";


////////////////////////////////////////////////////////////////////////////////

NabtoStatus.Category = {};
NabtoStatus.Category.API              = 1;
NabtoStatus.Category.P2P              = 2;
NabtoStatus.Category.DEVICE_EXCEPTION = 3;
NabtoStatus.Category.WRAPPER          = 4;

////////////////////////////////////////////////////////////////////////////////


function NabtoStatus(category, status, innerError) {
  if (typeof(category) === "undefined") {
    throw new Error("Missing or invalid category");
  }
  this.initStatus(category, status, innerError);
  
  this.__defineGetter__('value', function() {
    return this.code;
  });

  this.__defineGetter__('message', function() {
    return this.lookupMessage(this.code);
  });

}

NabtoStatus.prototype.initStatus = function(category, status, doc) {
  switch (category) {
  case NabtoStatus.Category.API:     this.handleApiError(status); break;
  case NabtoStatus.Category.P2P:     this.handleP2pError(doc); break;
  case NabtoStatus.Category.WRAPPER: this.handleWrapperError(status); break;
  default:
    throw new Error("Invalid category: " + category);
  }
};

NabtoStatus.prototype.lookupMessage = function(code) {
  return NabtoStatus.Message[code];
};

NabtoStatus.prototype.handleApiError = function(status) {
  if (status > NabtoConstants.ClientApiErrors.INVALID_STREAM_OPTION_ARGUMENT) {
    return this.handleUnexpected(`Unexpected API status [${status}]`);
  }

  this.inner = status;
  this.category = NabtoStatus.Category.API;
  
  switch (status) {
    
  case NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED:
    this.code = NabtoStatus.Code.API_NOT_INITIALIZED;
    break;
    
  case NabtoConstants.ClientApiErrors.INVALID_SESSION:
    this.code = NabtoStatus.Code.API_INVALID_SESSION;
    break;

  case NabtoConstants.ClientApiErrors.UNLOCK_PK_FAILED:
    this.code = NabtoStatus.Code.API_UNLOCK_KEY_BAD_PASSWORD;
    break;

  case NabtoConstants.ClientApiErrors.PORTAL_LOGIN_FAILURE:
    this.code = NabtoStatus.Code.API_SERVER_LOGIN_FAILURE;
    break;

  case NabtoConstants.ClientApiErrors.OPEN_CERT_OR_PK_FAILED:
  case NabtoConstants.ClientApiErrors.NO_PROFILE:
    this.code = NabtoStatus.Code.API_CERT_OPEN_FAIL;
    break;
    
  defau1t:
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
  this.inner = error;
  if (!(error && error.event)) {
    this.handleUnexpectedObject(obj);
  } else {
    if (error.event == NabtoConstants.ClientEvents.UNABTO_APPLICATION_EXCEPTION) {
      this.handleDeviceException(error);
    } else {
      this.handleNabtoEvent(error);
    }
  }
};

NabtoStatus.prototype.handleWrapperError = function(status) {
  this.code = status;
  this.category = NabtoStatus.Category.WRAPPER;
};

NabtoStatus.prototype.handleDeviceException = function(error) {
  // unabto/src/unabto/unabto_protocol_exceptions.h
  try {
    if (!error.detail) {
      throw "Unexpected error object: " + error;
    }
    this.code = this.mapExceptionStringToCode(error.detail);
    this.category = NabtoStatus.Category.DEVICE_EXCEPTION;
    this.inner = error;
  } catch (e) {
    this.handleUnexpectedObject(error);
  }
};

NabtoStatus.prototype.mapExceptionStringToCode = function(exception) {
  var prefix = "NP_E_";
  var s = exception.substring(prefix.length);
  if (NabtoConstants.DeviceExceptions.hasOwnProperty(s)) {
    return NabtoStatus.Code.EXC_BASE + NabtoConstants.DeviceExceptions[s];
  } else {
    throw "Unexpected device exception code: " + s;
  }
};

NabtoStatus.prototype.handleNabtoEvent = function(obj) {
  switch (obj.event) {

  case NabtoConstants.ClientEvents.ACCESS_DENIED:
    this.code = NabtoStatus.Code.P2P_ACCESS_DENIED_CONNECT;
    break;

  case NabtoConstants.ClientEvents.MICROSERVER_NOT_KNOWN:
    this.code = NabtoStatus.Code.P2P_DEVICE_OFFLINE;
    break;

  case NabtoConstants.ClientEvents.CONNECTION_PROBLEM:
    this.code = NabtoStatus.Code.P2P_CONNECTION_PROBLEM;
    break;
        
  case NabtoConstants.ClientEvents.ENCRYPTION_MISMATCH:
    this.code = NabtoStatus.Code.P2P_ENCRYPTION_MISMATCH;
    break;

  case NabtoConstants.ClientEvents.MICROSERVER_BUSY:
    this.code = NabtoStatus.Code.P2P_DEVICE_BUSY;
    break;

  case NabtoConstants.ClientEvents.MICROSERVER_REATTACHING:
    this.code = NabtoStatus.Code.P2P_DEVICE_REATTACHING;
    break;
        
  case NabtoConstants.ClientEvents.CERT_CREATION_ERROR:
    this.code = NabtoStatus.Code.P2P_CERT_CREATION_ERROR;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_PARSE_ERROR:
    this.code = NabtoStatus.Code.P2P_INTERFACE_DEF_INVALID;
    break;

  case NabtoConstants.ClientEvents.TIME_OUT:
  case NabtoConstants.ClientEvents.CONNECT_TIMEOUT:
    this.code = NabtoStatus.Code.P2P_TIMEOUT;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_NO_SUCH_REQUEST:
  case NabtoConstants.ClientEvents.FILE_NOT_FOUND:
    this.code = NabtoStatus.Code.P2P_NO_SUCH_REQUEST;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_PARAMETER_PARSE_ERROR:
    this.code = NabtoStatus.Code.P2P_PARAM_PARSE_ERROR;
    break;
        
  case NabtoConstants.ClientEvents.QUERY_MODEL_MISSING_PARAMETER:
    this.code = NabtoStatus.Code.P2P_PARAM_MISSING;
    break;

  case NabtoConstants.ClientEvents.NO_NETWORK:
  case NabtoConstants.ClientEvents.NO_INTERNET_ACCESS:
    this.code = NabtoStatus.Code.P2P_NO_NETWORK;
    break;
                
  default:    
    this.code = NabtoStatus.Code.P2P_OTHER;
    break;
  }

  this.category = NabtoStatus.Category.P2P;
};

NabtoStatus.prototype.handleUnexpected = function(inner) {
  this.category = NabtoStatus.Category.WRAPPER;
  this.code = NabtoStatus.Code.CDV_UNEXPECTED_DATA;
  this.inner = inner;
};

NabtoStatus.prototype.handleUnexpectedObject = function(obj) {
  var inner;
  try {
    var json = JSON.stringify(obj);
    inner = `Unexpected object: ${json}`; 
  } catch (e) {
    inner = "Invalid JSON response"; 
  }
  return this.handleUnexpected(inner);
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

module.exports = NabtoStatus;
