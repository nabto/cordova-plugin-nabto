/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

public class UrlResult {
    private byte[] result;
    private String mimeType;
    private NabtoStatus nabtoStatus;

    public UrlResult(byte[] _result, String _mimeType, int _nabtoStatus) {
        this.result = _result;
        this.mimeType = _mimeType;
        this.nabtoStatus = NabtoStatus.fromInteger(_nabtoStatus);
    }

    public byte[] getResult() {
        return result;
    }

    public String getMimetype() {
        return mimeType;
    }

    public NabtoStatus getNabtoStatus() {
        return nabtoStatus;
    }
}
