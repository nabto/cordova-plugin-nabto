/*
 * Copyright (C) 2008-2017 Nabto - All Rights Reserved.
 */

#import <Foundation/Foundation.h>

/**
 * The NabtoClient class is an Objective C wrapper for the plain C-based Nabto Client SDK. The
 * wrapper somewhat simplifies usage of the latter through a more Objective C style interface.
 *
 * See nabto_client_api.h for detailed documentation.
 *
 * Only the most commonly used functionality is exposed through the wrapper: User profile, RPC and Tunnel
 * functions. For more control and to access the detailed streaming API, the plain C api must be
 * used (also exposed through the NabtoClient framework, see nabto_client_api.h).
 *
 * Data is passed between SDK and application through raw C-buffers so memory must still be managed
 * by the application regardless of ARC settings. So for instance, you must still invoke nabtoFree()
 * on e.g. the result buffer from nabtoRpcInvoke()).
 *
 * The singleton instance wraps a single Nabto client session, sufficient for most applications. So
 * when comparing with the the general SDK documentation, the Nabto session parameter is omitted
 * from all functions.
 *
 * The following is a full working API interaction to invoke an RPC function on a device adhering
 * to the specified interface:
 
 if ([[NabtoClient instance] nabtoStartup] != NCS_OK) {
 // handle error
 }
 if ([[NabtoClient instance] nabtoOpenSessionGuest] != NCS_OK) {
 // handle error
 }
 
 NSString* interfaceXml = @"<unabto_queries><query name='wind_speed.json' id='2'><request></request><response format='json'><parameter name='rpc_speed_m_s' type='uint32'/></response></query></unabto_queries>";
 
 char* errorMsg;
 if ([[NabtoClient instance] nabtoRpcSetDefaultInterface:interfaceXml withErrorMessage:&errorMsg] != IOS_NABTO_OK) {
 // handle error
 }
 
 char* json;
 NabtoClientStatus status = [[NabtoClient instance] nabtoRpcInvoke:@"nabto://demo.nabto.net/wind_speed.json?" withResultBuffer:&json];
 if (status == IOS_NABTO_OK) {
 NSLog(@"rpcInvoke finished with result: %s", json);
 nabtoFree(json);
 }
 
 [[NabtoClient instance] nabtoShutdown];
 
 */

// see nabto_status enum in nabto_client_api.h for details
typedef NS_ENUM(NSInteger, NabtoClientStatus) {
    NCS_OK,
    NCS_NO_PROFILE,
    NCS_ERROR_READING_CONFIG,
    NCS_API_NOT_INITIALIZED,
    NCS_INVALID_SESSION,
    NCS_OPEN_CERT_OR_PK_FAILED,
    NCS_UNLOCK_PK_FAILED,
    NCS_PORTAL_LOGIN_FAILURE,
    NCS_CERT_SIGNING_ERROR,
    NCS_CERT_SAVING_FAILURE,
    NCS_ADDRESS_IN_USE,
    NCS_INVALID_ADDRESS,
    NCS_NO_NETWORK,
    NCS_CONNECT_TO_HOST_FAILED,
    NCS_STREAMING_UNSUPPORTED,
    NCS_INVALID_STREAM,
    NCS_DATA_PENDING,
    NCS_BUFFER_FULL,
    NCS_FAILED,
    NCS_INVALID_TUNNEL,
    NCS_ILLEGAL_PARAMETER,
    NCS_INVALID_RESOURCE,
    NCS_INVALID_STREAM_OPTION,
    NCS_INVALID_STREAM_OPTION_ARGUMENT,
    NCS_ABORTED,
    NCS_STREAM_CLOSED,
    NCS_FAILED_WITH_JSON_MESSAGE,
    NCS_ERROR_CODE_COUNT
};

// see nabto_tunnel_state enum in nabto_client_api.h for details
typedef NS_ENUM(NSInteger, NabtoTunnelState) {
    NTS_CLOSED,
    NTS_CONNECTING,
    NTS_READY_FOR_RECONNECT,
    NTS_UNKNOWN,
    NTS_LOCAL,
    NTS_REMOTE_P2P,
    NTS_REMOTE_RELAY,
    NTS_REMOTE_RELAY_MICRO
};

struct NabtoOpaqueTunnel;
typedef struct NabtoOpaqueTunnel* NabtoTunnelHandle;

// TODO: missing docs for wrapper (NABTO-1911), see nabto_client_api.h for API documentation until fixed
@interface NabtoClient : NSObject {
}

- (NabtoClientStatus)nabtoStartup;
- (NabtoClientStatus)nabtoShutdown;
- (NabtoClientStatus)nabtoSetOption:(NSString *)name withValue:(NSString *)value;
- (NabtoClientStatus)nabtoInstallDefaultStaticResources:(NSString *)resourceDir;
- (NabtoClientStatus)nabtoSetStaticResourceDir:(NSString *)resourceDir;

- (NSString *)nabtoVersion;
- (NSString *)nabtoVersionString;

- (NabtoClientStatus)nabtoCreateProfile:(NSString *)id withPassword:(NSString *)password;
- (NabtoClientStatus)nabtoCreateSelfSignedProfile:(NSString *)id withPassword:(NSString *)password;
- (NabtoClientStatus)nabtoSignup:(NSString *)id withPassword:(NSString *)password;
- (NabtoClientStatus)nabtoResetAccountPassword:(NSString *)id;
- (NabtoClientStatus)nabtoRemoveProfile:(NSString *)id;
- (NabtoClientStatus)nabtoGetFingerprint:(NSString *)certificateId withResult:(char[16])result;

- (NabtoClientStatus)nabtoOpenSession:(NSString *)email withPassword:(NSString *)password;
- (NabtoClientStatus)nabtoOpenSessionGuest;
- (NabtoClientStatus)nabtoCloseSession;

- (NabtoClientStatus)nabtoSetBasestationAuthJson:(NSString *)jsonKeyValuePairs;
- (NabtoClientStatus)nabtoSetLocalConnectionPsk:(NSString *)host withPskId:(char[16])pskId withPsk:(char[16])psk;

- (NabtoClientStatus)nabtoFetchUrl:(NSString *)url withResultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLength mimeType:(char **)mimeType;
- (NabtoClientStatus)nabtoSubmitPostData:(NSString *)url withBuffer:(NSString *)postBuffer resultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLen mimeType:(char **)mimeType;

- (NabtoClientStatus)nabtoRpcInvoke:(NSString *)url withResultBuffer:(char **)jsonResponse;
- (NabtoClientStatus)nabtoRpcSetDefaultInterface:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage;
- (NabtoClientStatus)nabtoRpcSetInterface:(NSString *)host withInterfaceDefinition:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage;

- (NSArray *)nabtoGetLocalDevices;
- (NSString *)nabtoGetSessionToken;

- (NabtoClientStatus)nabtoTunnelOpenTcp:(NabtoTunnelHandle *)handle toHost:(NSString *)host onPort:(int)port;
- (int)nabtoTunnelVersion:(NabtoTunnelHandle)handle;
- (NabtoTunnelState)nabtoTunnelInfo:(NabtoTunnelHandle)handle;
- (int)nabtoTunnelError:(NabtoTunnelHandle)handle; // return the internal nabto error on the tunnel
- (int)nabtoTunnelPort:(NabtoTunnelHandle)handle;
- (NabtoClientStatus)nabtoTunnelClose:(NabtoTunnelHandle)handle;
- (NabtoClientStatus)nabtoTunnelSetRecvWindowSize:(NabtoTunnelHandle)handle withRecvWindowSize:(int)recvWindowSize;
- (NabtoClientStatus)nabtoTunnelSetSendWindowSize:(NabtoTunnelHandle)handle withSendWindowSize:(int)sendWindowSize;

- (NabtoClientStatus)nabtoFree:(void *)p;

+ (id)instance;
+ (NSString *)nabtoStatusString:(NabtoClientStatus)status;
+ (NSString *)nabtoTunnelInfoString:(NabtoTunnelState)status;

@end
