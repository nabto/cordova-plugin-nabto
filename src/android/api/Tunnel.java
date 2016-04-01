/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

public class Tunnel {
    private Object tunnel;
    private NabtoStatus nabtoStatus;
    private String tunnelId;
    private static int nTunnel = 0;

    public Tunnel(Object _tunnel, int _nabtoStatus) {
        tunnel = _tunnel;
        tunnelId = "Tunnel " + nTunnel++;
        nabtoStatus = NabtoStatus.fromInteger(_nabtoStatus);
    }

    public Object getTunnel() {
        return tunnel;
    }

    public NabtoStatus getStatus() {
        return nabtoStatus;
    }

    @Override
    public String toString() {
        return tunnelId;
    }
}
