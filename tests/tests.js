/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova, nabto, NabtoStatus, NabtoError, NabtoTunnelState */

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

    it('gets error with invalid arguments to fetchUrl', function(done) {
      nabto.fetchUrl(123, function(status, result) {
        expect(result).not.toBeDefined();
        expect(status.error).toBe(NabtoError.INVALID_ARG);
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
        expect(status.error).toBe(NabtoError.PARSE_ERROR);
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

    it('shuts down nabto', function(done) {
      nabto.shutdown(function(status) {
        expect(status).not.toBeDefined();
        done();
      });
    });
  });

  describe('Nabto Tunnel', function() {
    var device = 'streamdemo.nabto.net',
      remotePort = 80;

    it('starts nabto', function(done) {
      nabto.startup(function(status) {
        expect(status).not.toBeDefined();
        done();
      });
    });

    it('gets tunnel state on closed tunnel', function(done) {
      nabto.tunnelState(function(status, state) {
        expect(status).not.toBeDefined();
        expect(state.value).toBe(-1);
        done();
      });
    });

    it('handles invalid arguments to tunnelOpenTcp', function(done) {
      nabto.tunnelOpenTcp(function(status) {
        expect(status.error).toBe(NabtoError.INVALID_ARG);
        nabto.tunnelOpenTcp(device, '5555', function(status) {
          expect(status.error).toBe(NabtoError.INVALID_ARG);
          nabto.tunnelOpenTcp(123, remotePort, function(status) {
            expect(status.error).toBe(NabtoError.INVALID_ARG);
            done();
          });
        });
      });
    });

    it('opens a nabto tunnel and wait for it to connect', function(done) {
      nabto.tunnelOpenTcp(device, remotePort, function(status) {
        expect(status).not.toBeDefined();
        var interval = setInterval(function() {
          nabto.tunnelState(function(status, state) {
            if (state.value <= NabtoTunnelState.NTCS_CONNECTING) { return; }
            clearInterval(interval);
            expect(state.value).toBeGreaterThan(NabtoTunnelState.NTCS_UNKNOWN);
            done();
          });
        }, 500);
      });
    });

    it('fails to open a second tunnel', function(done) {
      nabto.tunnelOpenTcp('2' + device, remotePort, function(status) {
        expect(status.value).toBe(NabtoStatus.INVALID_TUNNEL);
        done();
      });
    });

    it('gets tunnel port and has a connection', function(done) {
      nabto.tunnelPort(function(status, port) {
        expect(status).not.toBeDefined();
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
      nabto.tunnelVersion(function(status, version) {
        expect(status).not.toBeDefined();
        expect(version).toBeGreaterThan(0);
        done();
      });
    });

    it('closes tunnel', function(done) {
      nabto.tunnelClose(function(status) {
        expect(status).not.toBeDefined();
        // Wait for tunnel to close
        setTimeout(function() {
          done();
        }, 500);
      });
    });

    it('does not connect to nonexisting device', function(done) {
      nabto.tunnelOpenTcp('nonexist.nabto.net', remotePort, function(status) {
        expect(status).not.toBeDefined();
        var interval = setInterval(function() {
          nabto.tunnelState(function(status, state) {
            if (state.value === NabtoTunnelState.NTCS_CONNECTING) { return; }
            clearInterval(interval);
            expect(state.value).toBe(NabtoTunnelState.NTCS_CLOSED);
            done();
          });
        }, 500);
      });
    });

    it('gets last error', function(done) {
      nabto.tunnelLastError(function(status) {
        expect(status.toString()).toBe('UNKNOWN');
        done();
      });
    });

    it('closes tunnel', function(done) {
      nabto.tunnelClose(function(status) {
        expect(status).not.toBeDefined();
        done();
      });
    });

    it('closes a non-open tunnel', function(done) {
      nabto.tunnelClose(function(status) {
        expect(status.value).toBe(NabtoStatus.INVALID_TUNNEL);
        done();
      });
    });

    it('shuts down nabto', function(done) {
      // Wait for tunnel to close
      setTimeout(function() {
        nabto.shutdown(function(status) {
          expect(status).not.toBeDefined();
          done();
        });
      }, 500);
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
  });
};

exports.defineManualTests = function(contentEl, createActionButton) {
  createActionButton('Simple Test', function() {
    console.log(JSON.stringify(nabto));
  });
};
