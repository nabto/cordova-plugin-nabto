/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

/* globals cordova */

function NabtoTunnelState(state) {
  this.state = !state && state !== 0 ? NabtoTunnelState.NTCS_CLOSED : state;
  if (this.state > NabtoTunnelState.NTCS_REMOTE_RELAY_MICRO) {
    this.state = NabtoTunnelState.NTCS_CLOSED;
  }

  this.__defineGetter__('value', function() {
    return this.state;
  });
}

NabtoTunnelState.prototype.getState = function() {
  return this.state;
};

NabtoTunnelState.prototype.toString = function() {
  for (var prop in NabtoTunnelState) {
    if (NabtoTunnelState.hasOwnProperty(prop)) {
      if (NabtoTunnelState[prop] === this.state) {
        return prop;
      }
    }
  }
  return 'NTCS_CLOSED';
};

NabtoTunnelState.NTCS_CLOSED = -1;
NabtoTunnelState.NTCS_CONNECTING = 0;
NabtoTunnelState.NTCS_READY_FOR_RECONNECT = 1;
NabtoTunnelState.NTCS_UNKNOWN = 2;
NabtoTunnelState.NTCS_LOCAL = 3;
NabtoTunnelState.NTCS_REMOTE_P2P = 4;
NabtoTunnelState.NTCS_REMOTE_RELAY = 5;
NabtoTunnelState.NTCS_REMOTE_RELAY_MICRO = 6;

module.exports = NabtoTunnelState;
