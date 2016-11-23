package com.nabto.api;

public class NabtoCApiWrapper {
    static {
        System.loadLibrary("nabto_client_api_jni");
    }

    // Configuration and initialization API
    public static native String nabtoVersion();
    public static native int nabtoStartup(String nabtoHomeDir);
    public static native int nabtoShutdown();
    public static native int nabtoSetStaticResourceDir(String nabtoResDir);
    public static native String[] nabtoGetProtocolPrefixes();
    public static native String[] nabtoGetLocalDevices();
    public static native int nabtoProbeNetwork(int timeoutMillis, String hostname);

    // The portal API
    public static native String nabtoLookupExistingProfile();
    public static native String[] nabtoGetCertificates();
    public static native int nabtoCreateProfile(String email, String password);
    public static native int nabtoSignup(String email, String password);
    public static native int nabtoResetAccountPassword(String email);

    // The session API
    public static native Session nabtoOpenSession(String email, String password);
    public static native Session nabtoOpenSessionBare();
    public static native int nabtoCloseSession(Object session);
    public static native RpcResult nabtoRpcSetDefaultInterface(String interfaceDefinition, Object session);
    public static native RpcResult nabtoRpcSetInterface(String host, String interfaceDefinition, Object session);
    public static native RpcResult nabtoRpcInvoke(String nabtoUrl, Object session);
    public static native UrlResult nabtoFetchUrl(String url, Object session);
    public static native UrlResult nabtoSubmitPostData(String nabtoUrl, byte[] postData, String postMimeType, Object session);
    public static native String nabtoGetSessionToken(Object session);

    // The streaming API
    public static native Stream nabtoStreamOpen(Object session, String nabtoHost);
    public static native int nabtoStreamClose(Object Stream);
    public static native StreamReadResult nabtoStreamRead(Object Stream);
    public static native int nabtoStreamWrite(Object stream, byte[] data);
    public static native int nabtoStreamConnectionType(Object stream);
    public static native int nabtoStreamSetOption(Object stream, int optionName, byte[] option);

    // The tunnel API
    public static native Tunnel nabtoTunnelOpenTcp(int localPort, String nabtoHost, String remoteHost, int remotePort, Object session);
    public static native int nabtoTunnelClose(Object tunnel);
    public static native TunnelInfoResult nabtoTunnelInfo(Object tunnel);
}
