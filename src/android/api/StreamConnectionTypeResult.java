/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

public class StreamConnectionTypeResult {
    private NabtoConnectionType connectionType;
    private NabtoStatus status;

    public StreamConnectionTypeResult(int connectionType, int status) {
        this.connectionType = NabtoConnectionType.fromInteger(connectionType);
        this.status = NabtoStatus.fromInteger(status);
    }

    public NabtoConnectionType getConnectionType() {
        return connectionType;
    }

    public NabtoStatus getNabtoStatus() {
        return status;
    }
}
