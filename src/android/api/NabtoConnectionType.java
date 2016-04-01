/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

package com.nabto.api;

public enum NabtoConnectionType {
    NCT_LOCAL,
    NCT_P2P,
    NCT_RELAY,
    NCT_UNKNOWN,
    NCT_RELAY_MICRO;

    public static NabtoConnectionType fromInteger(int connectionType) {
        if (connectionType < NabtoConnectionType.values().length) {
            return NabtoConnectionType.values()[connectionType];
        } else {
            return NCT_UNKNOWN;
        }
    }
}
