var started = false;

var responses = {
  "ok" : {
   "request" : {},
   "response" : {
      "speed_m_s" : 11814
   }
  },
  "offline": {
    "error" : {
      "event" : 1000015,
      "header" : "Device Unavailable (1000015)",
      "body" : "The requested device is currently not online. Make sure the device is turned on and is connected to the network.",
      "detail" : "nabto://offline.nabto.net/wind_speed.json?"
    }
  },
  
  "exception": {
    "error": {
      "event": 2000065,
      "header": "Error in device application (2000065)",
      "body": "Communication with the device succeeded, but the application on the device returned error code NP_E_NO_ACCESS",
      "detail": "NP_E_NO_ACCESS"
    }
  }
};


function nextTick(cb) {
  setTimeout(cb, 0);
}

function startup(success, error, opts) {
  if (opts && typeof(opts[0]) === 'string' && opts[0].length > 0 && opts[0] !== 'guest') {
    if (opts[0].indexOf('bad_password') != -1) {
      return nextTick(function() { error(NabtoConstants.ClientApiErrors.UNLOCK_PK_FAILED); });
    } else if (opts[0].indexOf('nonexisting') != -1) {
      return nextTick(function() { error(NabtoConstants.ClientApiErrors.PORTAL_LOGIN_FAILURE); }); 
    } else {
      throw "Unexpected stub input [" + opts[0] + "]";
    }
  }
  started = true;
  nextTick(function() { success(); });
}

function shutdown(success, error, opts) {
  started = false;
  nextTick(function() { success(); });
}

function fetchUrl(success, error, opts) {
  if (!started) {
    return nextTick(
      function() {
	error(NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED);
      });
  };
  if (opts && typeof(opts[0]) === 'string' && opts[0].length > 0) {
    var url = opts[0];
    if (url.indexOf('error') == -1) {
      console.log("NabtoClientApi Stub - OK [" + url + "]");
      return nextTick(function() { success(JSON.stringify(responses.ok)); } );     
    } else {
      if (url.indexOf('offline') != -1) {
	console.log("NabtoClientApi Stub - ERROR (offline)");
	return nextTick(function() { success(JSON.stringify(responses.offline)); });
      } else if (url.indexOf('exception') != -1) {
	console.log("NabtoClientApi Stub - ERROR (device exception)");
	return nextTick(function() { success(JSON.stringify(responses.exception)); });
      } else {
	console.log("NabtoClientApi Stub - ERROR (other)");
	return nextTick(function() { success("api invoked successfully, but unspecified error internally in sdk"); });
      }
    }
  } else {
    return nextTick(function() { success("bad input - probably never here as this was caught in nabto.js"); });
  }

};

function getSessionToken(success, error, opts) {
  if (!started) {
    return nextTick(
      function() {
	error(NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED);
      });
  }
  return nextTick(function() { success("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); });
};

function getLocalDevices(success, error, opts) {
  if (!started) {
    return nextTick(
      function() {
	error(NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED);
      });
  }
  return nextTick(function() {
    var devices = [ "stub-device1.nabto.net",
		    "stub-device2.nabto.net",
		    "stub-device3.nabto.net"];
    success(devices);
  });
};

function version(success, error, opts) {
  if (!started) {
    return nextTick(
      function() {
	error(NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED);
      });
  }
  return nextTick(function() { success("2.12345"); });
};



module.exports = {
  startup: startup,
  shutdown: shutdown,
  fetchUrl: fetchUrl,
  getSessionToken: getSessionToken,
  getLocalDevices: getLocalDevices,
  version: version
};

require('cordova/exec/proxy').add('Nabto', module.exports);
