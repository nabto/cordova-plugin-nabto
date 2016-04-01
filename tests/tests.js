/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova, nabto, NabtoStatus, NabtoError */

exports.defineAutoTests = function () {
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

    it('cannot fetch url with non-open nabto', function(done) {
      nabto.fetchUrl(testUrl, function(status, result) {
        expect(status.value).toBe(NabtoStatus.API_NOT_INITIALIZED);
        expect(status.toString()).toBe('API_NOT_INITIALIZED');
        done();
      });
    });

    it('cannot startup nabto with invalid username/password', function(done) {
      nabto.startup('nonexisting', '1234567', function(status) {
        expect([7, 5]).toContain(status.value);
        done();
      });
    });

    it('starts up nabto with username/password', function(done) {
      nabto.startup('guest', '123456', function(status) {
        expect(status).not.toBeDefined();
        done();
      });
    });

    it('fetches a nabto url', function(done) {
      nabto.fetchUrl(testUrl, function(status, result) {
        expect(status).not.toBeDefined();
        expect(result.request).toBeDefined();
        expect(result.response.speed_m_s).toBeDefined();
        done();
      });
    });

    it('returns json error when fetching a non-existing json url', function(done) {
      nabto.fetchUrl('nabto://nonexisting.nabto.net/test.json', function(status, result) {
        expect(status).not.toBeDefined();
        expect(result.error.event).toBe(1000015);
        done();
      });
    });

    it('returns error when fetching a non-existing url', function(done) {
      nabto.fetchUrl('nabto://nonexisting.nabto.net', function(status, result) {
        expect(status).toBeDefined();
        expect(status.value).toBe(NabtoError.PARSE_ERROR);
        done();
      });
    });

    it('can get active session token', function(done) {
      nabto.getSessionToken(function(status, token) {
        expect(status).not.toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBe(44);
        done();
      });
    });

    it('can get local nabto devices', function(done) {
      nabto.getLocalDevices(function(status, devices) {
        expect(status).not.toBeDefined();
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
      nabto.version(function(status, version) {
        expect(status).not.toBeDefined();
        expect(version[0]).toBe('2');
        expect(version.indexOf('.')).toBe(1);
        expect(version).toBeGreaterThan(2);
        done();
      });
    });
  });

  describe('Nabto Status', function() {
    it('has global nabto status object', function() {
      expect(NabtoStatus).toBeDefined();
      expect(NabtoStatus.OK).toBe(0);
      expect(NabtoStatus.INVALID_STREAM).toBe(15);
    });

    it('can create new status and get value', function() {
      var status = new NabtoStatus(10);
      expect(status.value).toBe(10);
      expect(status.toString()).toBe('ADDRESS_IN_USE');
    });

    it('handles edge cases', function() {
      var status = new NabtoStatus();
      expect(status.toString()).toBe('OK');

      status = new NabtoStatus(99999);
      expect(status.value).toBe(-1);
      expect(status.getStatus()).toBe(-1);
      expect(status.toString()).toBe('UNKNOWN');

      status = new NabtoStatus(-10);
      expect(status.toString()).toBe('UNKNOWN');
    });
  });

  describe('Nabto Error', function() {
    it('has global nabto error object', function() {
      expect(NabtoError).toBeDefined();
      expect(NabtoError.OK).toBe(0);
      expect(NabtoError.INVALID_ARG).toBe(2);
    });

    it('can create new error and get value', function() {
      var error = new NabtoError(2);
      expect(error.value).toBe(2);
      expect(error.toString()).toBe('INVALID_ARG');
    });

    it('handles edge cases', function() {
      var error = new NabtoError();
      expect(error.toString()).toBe('OK');

      error = new NabtoError(99999);
      expect(error.value).toBe(-1);
      expect(error.getError()).toBe(-1);
      expect(error.toString()).toBe('UNKNOWN');

      error = new NabtoError(-10);
      expect(error.toString()).toBe('UNKNOWN');
    });
  });
};

exports.defineManualTests = function(contentEl, createActionButton) {
  createActionButton('Simple Test', function() {
    console.log(JSON.stringify(nabto));
  });
};
