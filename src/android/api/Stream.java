/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

public class Stream {
    private Object stream;
    private NabtoStatus status;

    public Stream(Object stream,  int status) {
        this.stream = stream;
        this.status = NabtoStatus.fromInteger(status);
    }

    public Object getStream() {
        return stream;
    }

    public NabtoStatus getStatus() {
        return status;
    }
}
