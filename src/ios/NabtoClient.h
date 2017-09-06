/*
 * Copyright (C) 2008-2017 Nabto - All Rights Reserved.
 */

#import <Foundation/Foundation.h>
#import "nabto_client_api.h"

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
 
 if ([[NabtoClient instance] nabtoStartup] != NABTO_OK) {
   // handle error
 }
 if ([[NabtoClient instance] nabtoOpenSessionGuest] != NABTO_OK) {
   // handle error
 }

 NSString* interfaceXml = @"<unabto_queries><query name='wind_speed.json' id='2'><request></request><response format='json'><parameter name='rpc_speed_m_s' type='uint32'/></response></query></unabto_queries>";
 
 char* errorMsg;
 if ([[NabtoClient instance] nabtoRpcSetDefaultInterface:interfaceXml withErrorMessage:&errorMsg] != NABTO_OK) {
   // handle error
 }
 
 char* json;
 nabto_status_t status = [[NabtoClient instance] nabtoRpcInvoke:@"nabto://demo.nabto.net/wind_speed.json?" withResultBuffer:&json];
 if (status == NABTO_OK) {
   NSLog(@"rpcInvoke finished with result: %s", json);
   nabtoFree(json);
 }
 
 [[NabtoClient instance] nabtoShutdown];
 
 */

@interface NabtoClient : NSObject {
}

- (nabto_status_t)nabtoStartup;
- (nabto_status_t)nabtoShutdown;
- (nabto_status_t)nabtoSetOption:(NSString *)name withValue:(NSString *)value;
- (nabto_status_t)nabtoInstallDefaultStaticResources:(NSString *)resourceDir;

- (NSString *)nabtoVersion;
- (NSString *)nabtoVersionString;

- (nabto_status_t)nabtoCreateProfile:(NSString *)id withPassword:(NSString *)password;
- (nabto_status_t)nabtoCreateSelfSignedProfile:(NSString *)id withPassword:(NSString *)password;
- (nabto_status_t)nabtoRemoveProfile:(NSString *)id;
- (nabto_status_t)nabtoGetFingerprint:(NSString *)certificateId withResult:(char[16])result;

- (nabto_status_t)nabtoOpenSession:(NSString *)email withPassword:(NSString *)password;
- (nabto_status_t)nabtoOpenSessionGuest;
- (nabto_status_t)nabtoCloseSession;

- (nabto_status_t)nabtoSetBasestationAuthJson:(NSString *)jsonKeyValuePairs;

- (nabto_status_t)nabtoFetchUrl:(NSString *)url withResultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLength mimeType:(char **)mimeType;
- (nabto_status_t)nabtoSubmitPostData:(NSString *)url withBuffer:(NSString *)postBuffer resultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLen mimeType:(char **)mimeType;

- (nabto_status_t)nabtoRpcInvoke:(NSString *)url withResultBuffer:(char **)jsonResponse;
- (nabto_status_t)nabtoRpcSetDefaultInterface:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage;
- (nabto_status_t)nabtoRpcSetInterface:(NSString *)host withInterfaceDefinition:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage;
                             
- (NSArray *)nabtoGetLocalDevices;
- (NSString *)nabtoGetSessionToken;

- (nabto_status_t)nabtoTunnelOpenTcp:(nabto_tunnel_t *)handle toHost:(NSString *)host onPort:(int)port;
- (int)nabtoTunnelVersion:(nabto_tunnel_t)handle;
- (nabto_tunnel_state_t)nabtoTunnelInfo:(nabto_tunnel_t)handle;
- (int)nabtoTunnelError:(nabto_tunnel_t)handle; // return the internal nabto error on the tunnel
- (int)nabtoTunnelPort:(nabto_tunnel_t)handle;
- (nabto_status_t)nabtoTunnelClose:(nabto_tunnel_t)handle;

- (nabto_status_t)nabtoFree:(void *)p;

+ (id)instance;
+ (NSString *)nabtoStatusString:(nabto_status_t)status;
+ (NSString *)nabtoTunnelInfoString:(nabto_tunnel_state_t)status;

@end
