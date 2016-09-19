/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova, nabto, NabtoStatus, NabtoError, NabtoTunnelState */

var errors = {
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

function xdescribe(title, func) {}

exports.defineAutoTests = function () {
  
  describe('NabtoStatus', function () {
    
    it('should have NabtoStatus available', function() {
      expect(NabtoStatus).toBeDefined();
    });

    it('should provide toString function', function() {
      var s = new NabtoStatus(NabtoStatus.Category.API, NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED);
      expect(s).toMatch("API_NOT_INITIALIZED");
    });
    
    it('should handle api error', function() {
      var s = new NabtoStatus(NabtoStatus.Category.API, NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED);
      expect(s.category).toBe(NabtoStatus.Category.API);
      expect(s.code).toBe(NabtoStatus.Code.API_NOT_INITIALIZED);
      expect(s.message).toMatch(/initialized/i);
      expect(s.inner).toBe(NabtoConstants.ClientApiErrors.API_NOT_INITIALIZED);
    });

    it('should handle ok api result with nabto error event', function() {
      var s = new NabtoStatus(NabtoStatus.Category.P2P, NabtoConstants.ClientApiErrors.OK, errors.offline);
      expect(s.category).toBe(NabtoStatus.Category.P2P);
      expect(s.code).toBe(NabtoStatus.Code.P2P_DEVICE_OFFLINE);
      expect(s.message).toMatch(/not online/i);
      expect(s.inner).toEqual(errors.offline.error);
    });

    it('should handle nabto error event with device exception', function() {
      var s = new NabtoStatus(NabtoStatus.Category.P2P, NabtoConstants.ClientApiErrors.OK, errors.exception);
      expect(s.category).toBe(NabtoStatus.Category.DEVICE_EXCEPTION);
      expect(s.code).toBe(NabtoStatus.Code.EXC_NO_ACCESS);
      expect(s.message).toMatch(/access denied/i);
      expect(s.inner).toEqual(errors.exception.error);
    });

    it('should gracefully handle unexpected input', function() {
      var dummy = { "foo": "bar" };
      var s = new NabtoStatus(NabtoStatus.Category.P2P, NabtoConstants.ClientApiErrors.OK, dummy);
      expect(s.category).toBe(NabtoStatus.Category.WRAPPER);
      expect(s.code).toBe(NabtoStatus.Code.CDV_UNEXPECTED_DATA);
      expect(s.inner).toMatch(/unexpected object/i);
      expect(s.message).toMatch(/unexpected status/i);
    });

    function hasPrefix(s, prefix) {
      return s.substr(0, prefix.length) === prefix;
    }

    function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
    
    function toNabtoEventCode(code) {
      // code = 3120;
      // event_code = 1000020
      if (Math.floor(code / 1000) != 3) {
	throw `unexpected base for nabto event: ${code/1000}`;
      }
      var base = (code - 3000);
      var major = Math.floor(base / 100) * 1000000;
      var minor = base - Math.floor((base / 100)) * 100;
      var event = major + minor;
      return event;
    }

    it('should handle nabto events correctly', function() {
      for (var p in NabtoStatus.Code) {
	if (NabtoStatus.Code.hasOwnProperty(p)) {
	  if (hasPrefix(p, "P2P_") && p !== "P2P_OTHER") {
	    var response = clone(errors.offline);
	    response.error.event = toNabtoEventCode(NabtoStatus.Code[p]);
	    var s = new NabtoStatus(NabtoStatus.Category.P2P, 0, response);
	    if (s.code == NabtoStatus.Code.P2P_OTHER) {
	      expect(p).toBe("Nabto event " + response.error.event + " not handled correctly");
	    } else {
	      expect(s.code).toBe(NabtoStatus.Code[p]);
	    }
	  }
	}
      }
    });

    it('should provide an error message for each error code', function() {
      for (var p in NabtoStatus.Code) {
	if (NabtoStatus.Code.hasOwnProperty(p)) {
	  if (NabtoStatus.Message[NabtoStatus.Code[p]]) {
	    expect(NabtoStatus.Message[NabtoStatus.Code[p]]).toBeDefined(); // no surprise (but otherwise we get a warning)
	  } else {
	    expect(p).toBe("Missing an error message"); // clumsy way to get a custom error message to include erroneous prop
	  }
	}
      }
    });
    
  });

  describe('NabtoApiInteraction', function () {
    var testUrl = 'nabto://demo.nabto.net/wind_speed.json?';

    it('should have a global nabto object', function() {
      expect(nabto).toBeDefined();
      expect(nabto.startup).toBeDefined();
    });

    it('starts up nabto', function(done) {
      nabto.startup(function(error) {
        expect(error).not.toBeDefined();
        done();
      });
    });

    it('can call startup multiple times', function(done) {
      // Wait a little for nabto startup to completely finish
      setTimeout(function() {
        nabto.startup(function(error) {
          expect(error).not.toBeDefined();
          nabto.startup(function(error) {
            expect(error).not.toBeDefined();
            done();
          });
        });
      }, 200);
    });

    it('shuts down nabto', function(done) {
      nabto.shutdown(function(error) {
        expect(error).not.toBeDefined();
        done();
      });
    });

    it('can call shutdown multiple times', function(done) {
      nabto.shutdown(function(error) {
        expect(error).not.toBeDefined();
        nabto.shutdown(function(error) {
          expect(error).not.toBeDefined();
          done();
        });
      });
    });

    it('cannot fetch url with non-open nabto', function(done) {
      nabto.fetchUrl(testUrl, function(error, result) {
        expect(error.code).toBe(NabtoStatus.Code.API_NOT_INITIALIZED);
        done();
      });
    });


    it('gets error with invalid arguments to fetchUrl', function(done) {
      nabto.fetchUrl(123, function(error, result) {
        expect(result).not.toBeDefined();
        expect(error.code).toBe(NabtoStatus.Code.CDV_INVALID_ARG);
        done();
      });
    });
    
    it('api error with invalid username', function(done) {
      nabto.startup('nonexisting', '1234567', function(error, result) {
        expect(result).not.toBeDefined();
        expect(error.code).toBe(NabtoStatus.Code.API_SERVER_LOGIN_FAILURE);
        done();
      });
    });

    /*
    it('api error with invalid password - fails in all but stub', function(done) {
      nabto.startup('bad_password', 'hesthest', function(error, result) {
        expect(result).not.toBeDefined();
        expect(error.code).toBe(NabtoStatus.Code.API_UNLOCK_KEY_BAD_PASSWORD);
        done();
      });
    });*/


    it('starts up nabto with username/password', function(done) {
      nabto.startup('guest', 'blank', function(error) {
        expect(error).not.toBeDefined();
        done();
      });
    });

    it('fetches a nabto url', function(done) {
      nabto.fetchUrl(testUrl, function(error, result) {
        expect(error).toBeNull();
        expect(result.response.speed_m_s).toBeDefined();
        done();
      });
    });

    it('returns json error when fetching an offline device', function(done) {
      nabto.fetchUrl('nabto://offline-error-216b3ea2.nabto.net/test.json', function(error, result) {
        expect(error).toBeDefined();
        expect(error.code).toBe(NabtoStatus.Code.P2P_DEVICE_OFFLINE);
        expect(result).toBeNull();
        done();
      });
    });

    it('can get active session token', function(done) {
      nabto.getSessionToken(function(error, token) {
        expect(error).not.toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBe(44);
        done();
      });
    });
/*
    it('can get local nabto devices', function(done) {
      nabto.getLocalDevices(function(error, devices) {
        expect(error).not.toBeDefined();
        expect(Object.prototype.toString.call(devices)).toBe('[object Array]');
        if (devices.length > 0) {
          devices.map(function(device) {
            expect(typeof device).toBe('string');
          });
        }
        else {
          console.error('There were no local nabto devices to test discover');
        }
        done();
      });
    });

    it('can return nabto client version', function(done) {
      nabto.version(function(error, version) {
        expect(error).not.toBeDefined();
        expect(version[0]).toBe('2');
        expect(version.indexOf('.')).toBe(1);
        expect(version).toBeGreaterThan(2);
        done();
      });
    });

    it('shuts down nabto', function(done) {
      nabto.shutdown(function(error) {
        expect(error).not.toBeDefined();
        done();
      });
    });
  });

  describe('Nabto Tunnel', function() {
    var device = 'streamdemo.nabto.net',
      remotePort = 80;

    it('starts nabto', function(done) {
      nabto.startup(function(error) {
        expect(error).not.toBeDefined();
        done();
      });
    });

    it('gets tunnel state on closed tunnel', function(done) {
      nabto.tunnelState(function(error, state) {
        expect(error).not.toBeDefined();
        expect(state.value).toBe(-1);
        done();
      });
    });

    it('handles invalid arguments to tunnelOpenTcp', function(done) {
      nabto.tunnelOpenTcp(function(error) {
        expect(error.error).toBe(NabtoError.INVALID_ARG);
        nabto.tunnelOpenTcp(device, '5555', function(error) {
          expect(error.error).toBe(NabtoError.INVALID_ARG);
          nabto.tunnelOpenTcp(123, remotePort, function(error) {
            expect(error.error).toBe(NabtoError.INVALID_ARG);
            done();
          });
        });
      });
    });

    it('opens a nabto tunnel and wait for it to connect', function(done) {
      nabto.tunnelOpenTcp(device, remotePort, function(error) {
        expect(error).not.toBeDefined();
        var interval = setInterval(function() {
          nabto.tunnelState(function(error, state) {
            if (state.value <= NabtoTunnelState.NTCS_CONNECTING) { return; }
            clearInterval(interval);
            expect(state.value).toBeGreaterThan(NabtoTunnelState.NTCS_UNKNOWN);
            done();
          });
        }, 500);
      });
    });

    it('fails to open a second tunnel', function(done) {
      nabto.tunnelOpenTcp('2' + device, remotePort, function(error) {
        expect(error.value).toBe(NabtoStatus.INVALID_TUNNEL);
        done();
      });
    });

    it('gets tunnel port and has a connection', function(done) {
      nabto.tunnelPort(function(error, port) {
        expect(error).not.toBeDefined();
        expect(port).toBeGreaterThan(1000);

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (xhttp.readyState !== 4) { return; }
          expect(xhttp.status).toBe(200);
          expect(xhttp.responseText).toContain('Serve a large file');
          done();
        };
        xhttp.open('GET', 'http://localhost:' + port, true);
        xhttp.send();
      });
    });

    it('gets tunnel version', function(done) {
      nabto.tunnelVersion(function(error, version) {
        expect(error).not.toBeDefined();
        expect(version).toBeGreaterThan(0);
        done();
      });
    });

    it('closes tunnel', function(done) {
      nabto.tunnelClose(function(error) {
        expect(error).not.toBeDefined();
        // Wait for tunnel to close
        setTimeout(function() {
          done();
        }, 500);
      });
    });

    it('does not connect to nonexisting device', function(done) {
      nabto.tunnelOpenTcp('nonexist.nabto.net', remotePort, function(error) {
        expect(error).not.toBeDefined();
        var interval = setInterval(function() {
          nabto.tunnelState(function(error, state) {
            if (state.value === NabtoTunnelState.NTCS_CONNECTING) { return; }
            clearInterval(interval);
            expect(state.value).toBe(NabtoTunnelState.NTCS_CLOSED);
            done();
          });
        }, 500);
      });
    });

    it('gets last error', function(done) {
      nabto.tunnelLastError(function(error) {
        expect(error.toString()).toBe('UNKNOWN');
        done();
      });
    });

    it('closes tunnel', function(done) {
      nabto.tunnelClose(function(error) {
        expect(error).not.toBeDefined();
        done();
      });
    });

    it('closes a non-open tunnel', function(done) {
      nabto.tunnelClose(function(error) {
        expect(error.value).toBe(NabtoStatus.INVALID_TUNNEL);
        done();
      });
    });

    it('shuts down nabto', function(done) {
      // Wait for tunnel to close
      setTimeout(function() {
        nabto.shutdown(function(error) {
          expect(error).not.toBeDefined();
          done();
        });
      }, 500);
    });
  });

  describe('Nabto Tunnel State', function() {
    it('can create new state and get value', function() {
      var state = new NabtoTunnelState(4);
      expect(state.value).toBe(4);
      expect(state.toString()).toBe('NTCS_REMOTE_P2P');
    });

    it('handles edge cases', function() {
      var state = new NabtoTunnelState();
      expect(state.toString()).toBe('NTCS_CLOSED');

      state = new NabtoTunnelState(99999);
      expect(state.value).toBe(-1);
      expect(state.getState()).toBe(-1);
      expect(state.toString()).toBe('NTCS_CLOSED');

      state = new NabtoTunnelState(-10);
      expect(state.toString()).toBe('NTCS_CLOSED');
    });

*/
  });
};

exports.defineManualTests = function(contentEl, createActionButton) {
  createActionButton('Simple Test !!', function() {
    var s = new NabtoStatus(1000015);
    console.log(s);
  });
};

