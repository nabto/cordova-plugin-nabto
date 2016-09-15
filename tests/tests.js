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
    
  });

  describe('Nabto', function () {
    var testUrl = 'nabto://demo.nabto.net/wind_speed.json?';

    it('should have a global nabto object', function() {
      expect(nabto).toBeDefined();
      expect(nabto.startup).toBeDefined();
    });

    it('starts up nabto', function(done) {
      nabto.startup(function(status) {
        expect(status).not.toBeDefined();
        done();
      });
    });

    it('can call startup multiple times', function(done) {
      // Wait a little for nabto startup to completely finish
      setTimeout(function() {
        nabto.startup(function(status) {
          expect(status).not.toBeDefined();
          nabto.startup(function(status) {
            expect(status).not.toBeDefined();
            done();
          });
        });
      }, 200);
    });

    it('shuts down nabto', function(done) {
      nabto.shutdown(function(status) {
        expect(status).not.toBeDefined();
        done();
      });
    });

    it('can call shutdown multiple times', function(done) {
      nabto.shutdown(function(status) {
        expect(status).not.toBeDefined();
        nabto.shutdown(function(status) {
          expect(status).not.toBeDefined();
          done();
        });
      });
    });

  });
};

exports.defineManualTests = function(contentEl, createActionButton) {
  createActionButton('Simple Test !!', function() {
    var s = new NabtoStatus(1000015);
    console.log(s);
  });
};

