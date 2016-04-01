/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

public enum StreamOptionName {
    NSO_RCVTIMEO(1),
    NSO_SNDTIMEO(2);

    private int numVal;

    StreamOptionName(int numVal) {
        this.numVal = numVal;
    }

    public int getNumVal() {
        return numVal;
    }
}
