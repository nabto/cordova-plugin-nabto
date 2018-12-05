/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 *
 * .mm extension important to force xcode to link C++ runtime as needed by Nabto SDK lib
 */

#import "NabtoClient.h"
#import "NabtoAPI/nabto_client_api.h"

@implementation NabtoClient
{
    nabto_handle_t session_;
    BOOL initialized_;
}

#define NABTOLOG 0

+ (id)instance {
    static NabtoClient *instance_ = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance_ = [[self alloc] init];
        instance_->session_ = nil;
    });
    return instance_;
}

void simulatorSymlinkDocDir() {
#if TARGET_OS_SIMULATOR
    NSString* homeDirectory = [[NSProcessInfo processInfo] environment][@"SIMULATOR_HOST_HOME"];
    NSURL *documentsDirectory = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject];
    NSString *documentsDirectoryPath = documentsDirectory.path;
    NSString *simlinkPath = [homeDirectory stringByAppendingFormat:@"/NabtoSimulatorDocuments"];
    unlink(simlinkPath.UTF8String);
    symlink(documentsDirectoryPath.UTF8String, simlinkPath.UTF8String);
#endif
}

NabtoClientStatus mapToClientStatus(nabto_status apiStatus) {
    switch (apiStatus) {
        case NABTO_OK: return                                 NCS_OK;
        case NABTO_NO_PROFILE: return                         NCS_NO_PROFILE;
        case NABTO_ERROR_READING_CONFIG: return               NCS_ERROR_READING_CONFIG;
        case NABTO_API_NOT_INITIALIZED: return                NCS_API_NOT_INITIALIZED;
        case NABTO_INVALID_SESSION: return                    NCS_INVALID_SESSION;
        case NABTO_OPEN_CERT_OR_PK_FAILED: return             NCS_OPEN_CERT_OR_PK_FAILED;
        case NABTO_UNLOCK_PK_FAILED: return                   NCS_UNLOCK_PK_FAILED;
        case NABTO_PORTAL_LOGIN_FAILURE: return               NCS_PORTAL_LOGIN_FAILURE;
        case NABTO_CERT_SIGNING_ERROR: return                 NCS_CERT_SIGNING_ERROR;
        case NABTO_CERT_SAVING_FAILURE: return                NCS_CERT_SAVING_FAILURE;
        case NABTO_ADDRESS_IN_USE: return                     NCS_ADDRESS_IN_USE;
        case NABTO_INVALID_ADDRESS: return                    NCS_INVALID_ADDRESS;
        case NABTO_NO_NETWORK: return                         NCS_NO_NETWORK;
        case NABTO_CONNECT_TO_HOST_FAILED: return             NCS_CONNECT_TO_HOST_FAILED;
        case NABTO_STREAMING_UNSUPPORTED: return              NCS_STREAMING_UNSUPPORTED;
        case NABTO_INVALID_STREAM: return                     NCS_INVALID_STREAM;
        case NABTO_DATA_PENDING: return                       NCS_DATA_PENDING;
        case NABTO_BUFFER_FULL: return                        NCS_BUFFER_FULL;
        case NABTO_FAILED: return                             NCS_FAILED;
        case NABTO_INVALID_TUNNEL: return                     NCS_INVALID_TUNNEL;
        case NABTO_ILLEGAL_PARAMETER: return                  NCS_ILLEGAL_PARAMETER;
        case NABTO_INVALID_RESOURCE: return                   NCS_INVALID_RESOURCE;
        case NABTO_INVALID_STREAM_OPTION: return              NCS_INVALID_STREAM_OPTION;
        case NABTO_INVALID_STREAM_OPTION_ARGUMENT: return     NCS_INVALID_STREAM_OPTION_ARGUMENT;
        case NABTO_ABORTED: return                            NCS_ABORTED;
        case NABTO_STREAM_CLOSED: return                      NCS_STREAM_CLOSED;
        case NABTO_FAILED_WITH_JSON_MESSAGE: return           NCS_FAILED_WITH_JSON_MESSAGE;
        case NABTO_ERROR_CODE_COUNT: return                   NCS_ERROR_CODE_COUNT;
        default: assert(!"never here");
    }
}

NabtoTunnelState mapToTunnelState(nabto_tunnel_state apiTunnelStatus) {
    switch (apiTunnelStatus) {
        case NTCS_CLOSED: return                 NTS_CLOSED;
        case NTCS_CONNECTING: return             NTS_CONNECTING;
        case NTCS_READY_FOR_RECONNECT: return    NTS_READY_FOR_RECONNECT;
        case NTCS_UNKNOWN: return                NTS_UNKNOWN;
        case NTCS_LOCAL: return                  NTS_LOCAL;
        case NTCS_REMOTE_P2P: return             NTS_REMOTE_P2P;
        case NTCS_REMOTE_RELAY: return           NTS_REMOTE_RELAY;
        case NTCS_REMOTE_RELAY_MICRO: return     NTS_REMOTE_RELAY_MICRO;
        default: assert(!"never here");
    }
}

void nabtoLogCallback(const char* line, size_t size) {
    const size_t interestingStuffStart = 50;
    size_t offset = size > interestingStuffStart ? interestingStuffStart : 0;
    const size_t bufSize = size + 1 - offset;
    char* nullTerminatedString = (char *)malloc(bufSize);
    memcpy(nullTerminatedString, line+offset, size-offset);
    nullTerminatedString[bufSize-1] = 0;

    NSData* buffer = [NSData dataWithBytesNoCopy:nullTerminatedString length:bufSize freeWhenDone:YES];
    NSString *entry = [[NSString alloc] initWithBytes:buffer.bytes length:buffer.length encoding:NSASCIIStringEncoding];
    NSLog(@"Nabto log: %@", entry);
}

- (NSString *)getHomeDir {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory , NSUserDomainMask, YES);
    NSString *documentsDir = [paths objectAtIndex:0];
    NSLog(@"Nabto home directory: %@", documentsDir);
    return [documentsDir stringByAppendingPathComponent:@"nabto/"];
}

- (NabtoClientStatus)nabtoStartup {
    @synchronized(self) {
        if (initialized_) {
            return NCS_OK;
        }
        initialized_ = YES;
    }
    simulatorSymlinkDocDir();

    NSString* dir = [self getHomeDir];
    nabto_status_t status = nabtoStartup([dir UTF8String]);
    if (status != NABTO_OK) {
        NSLog(@"Error starting nabto");
        return mapToClientStatus(status);
    }
    status = nabtoInstallDefaultStaticResources([dir UTF8String]);
    if (status != NABTO_OK) {
        NSLog(@"Error installing resources");
        return mapToClientStatus(status);
    }

    nabtoSetOption("dnsHints", "stun.nabto.net,global.cloud.nabto.com,cn-north-1.cloud.nabto.com");

#if NABTOLOG
    nabtoRegisterLogCallback(nabtoLogCallback);
#endif

    return mapToClientStatus(status);
}

- (NabtoClientStatus)nabtoSetOption:(NSString *)name withValue:(NSString *)value {
    return mapToClientStatus(nabtoSetOption([name UTF8String], [value UTF8String]));
}

- (NabtoClientStatus)nabtoShutdown {
    @synchronized(self) {
        initialized_ = false;
    }
    [self nabtoCloseSession];
    return mapToClientStatus(nabtoShutdown());
}

- (NabtoClientStatus)nabtoInstallDefaultStaticResources:(NSString *)resourceDir {
    if (!resourceDir) {
        resourceDir = [self getHomeDir];
    }
    return mapToClientStatus(nabtoInstallDefaultStaticResources([resourceDir UTF8String]));
}

- (NabtoClientStatus)nabtoSetStaticResourceDir:(NSString *)resourceDir {
    return mapToClientStatus(nabtoSetStaticResourceDir([resourceDir UTF8String]));
}

- (NSString *)nabtoVersion {
    int major, minor;
    nabtoVersion(&major, &minor);
    return [NSString stringWithFormat:@"%i.%i", major, minor];
}

- (NSString *)nabtoVersionString {
    char* version;
    NSString* result;
    if (nabtoVersionString(&version) == NABTO_OK) {
        result = [NSString stringWithCString:version encoding:NSASCIIStringEncoding];
        nabtoFree(version);
    } else {
        result = @"(undefined)";
    }
    return result;
}

- (NabtoClientStatus)nabtoOpenSession:(NSString *)email withPassword:(NSString *)password {
    return mapToClientStatus(nabtoOpenSession(&session_, [email UTF8String], [password UTF8String]));
}

- (NabtoClientStatus)nabtoCreateProfile:(NSString *)email withPassword:(NSString *)password {
    return mapToClientStatus(nabtoCreateProfile([email UTF8String], [password UTF8String]));
}

- (NabtoClientStatus)nabtoCreateSelfSignedProfile:(NSString *)email withPassword:(NSString *)password {
    return mapToClientStatus(nabtoCreateSelfSignedProfile([email UTF8String], [password UTF8String]));
}

- (NabtoClientStatus)nabtoSignup:(NSString *)email withPassword:(NSString *)password {
    return mapToClientStatus(nabtoSignup([email UTF8String], [password UTF8String]));
}

- (NabtoClientStatus)nabtoResetAccountPassword:(NSString *)email {
    return mapToClientStatus(nabtoResetAccountPassword([email UTF8String]));
}

- (NabtoClientStatus)nabtoRemoveProfile:(NSString *)id {
    return mapToClientStatus(nabtoRemoveProfile([id UTF8String]));
}

- (NabtoClientStatus)nabtoGetFingerprint:(NSString *)certificateId withResult:(char[16])result {
    return mapToClientStatus(nabtoGetFingerprint([certificateId UTF8String], result));
}


- (NabtoClientStatus)nabtoOpenSessionGuest {
    NSString *email = @"guest";
    NSString *password = @"";
    return [self nabtoOpenSession:email withPassword:password];
}

- (NabtoClientStatus)nabtoCloseSession {
    if (session_) {
        nabto_status_t res = nabtoCloseSession(session_);
        if (res == NABTO_OK) {
            session_ = nil;
        }
        return mapToClientStatus(res);
    } else {
        return NCS_OK;
    }
}

- (NabtoClientStatus)nabtoSetLocalConnectionPsk:(NSString *)host withPskId:(char[16])pskId withPsk:(char[16])psk {
    return mapToClientStatus(nabtoSetLocalConnectionPsk(session_, [host UTF8String], pskId, psk));
}

- (NabtoClientStatus)nabtoSetBasestationAuthJson:(NSString *)jsonKeyValuePairs {
    return mapToClientStatus(nabtoSetBasestationAuthJson(session_, [jsonKeyValuePairs UTF8String]));
}

- (NabtoClientStatus)nabtoFetchUrl:(NSString *)url withResultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLength mimeType:(char **)mimeType {
    return mapToClientStatus(nabtoFetchUrl(session_, [url UTF8String], resultBuffer, resultLength, mimeType));
}

- (NabtoClientStatus)nabtoRpcInvoke:(NSString *)url withResultBuffer:(char **)jsonResponse {
    return mapToClientStatus(nabtoRpcInvoke(session_, [url UTF8String], jsonResponse));
}

- (NabtoClientStatus)nabtoRpcSetDefaultInterface:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage {
    return mapToClientStatus(nabtoRpcSetDefaultInterface(session_, [interfaceDefinition UTF8String], errorMessage));
}


- (NabtoClientStatus)nabtoRpcSetInterface:(NSString *)host withInterfaceDefinition:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage {
    return mapToClientStatus(nabtoRpcSetInterface(session_, [host UTF8String], [interfaceDefinition UTF8String], errorMessage));
}

- (NabtoClientStatus)nabtoSubmitPostData:(NSString *)url withBuffer:(NSString *)postBuffer resultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLen mimeType:(char **)mimeType {
    return mapToClientStatus(nabtoSubmitPostData(session_, [url UTF8String], [postBuffer UTF8String], [postBuffer length], "", resultBuffer, resultLen, mimeType));
}

- (NSArray *)nabtoGetLocalDevices {
    char** devices;
    int nDevices = 0;

    nabto_status_t status = nabtoGetLocalDevices(&devices, &nDevices);
    if (status != NABTO_OK) {
        NSLog(@"Error getting local devices: %i", status);
        return [[NSArray alloc] init];
    }

    NSMutableArray *array = [[NSMutableArray alloc] init];
    for (int i = 0; i < nDevices; i++) {
        [array addObject:[NSString stringWithFormat:@"%s", devices[i]]];
    }

    return [array copy];
}

- (NSString *)nabtoGetSessionToken {
    const size_t size = 64;
    char buffer[size+1];
    size_t resLen;
    if (nabtoGetSessionToken(session_, buffer, size, &resLen) == NABTO_OK && resLen <= size) {
        buffer[resLen] = 0;
        return [NSString stringWithCString:buffer encoding:NSASCIIStringEncoding];
    } else {
        return NULL;
    }
}

- (NabtoClientStatus)nabtoTunnelOpenTcp:(NabtoTunnelHandle *)handle toHost:(NSString *)host onPort:(int)port {
    return mapToClientStatus(nabtoTunnelOpenTcp((nabto_tunnel_t *)handle, session_, 0, [host UTF8String], "127.0.0.1", port));
}

- (int)nabtoTunnelVersion:(NabtoTunnelHandle)handle {
    int version = 0;
    nabtoTunnelInfo((nabto_tunnel_t)handle, NTI_VERSION, sizeof(version), &version);
    return version;
}

- (NabtoTunnelState)nabtoTunnelInfo:(NabtoTunnelHandle)handle {
    nabto_tunnel_state_t state = NTCS_CLOSED;
    nabtoTunnelInfo((nabto_tunnel_t)handle, NTI_STATUS, sizeof(state), &state);
    return mapToTunnelState(state);
}

- (int)nabtoTunnelError:(NabtoTunnelHandle)handle {
    int lastError = -1;
    nabtoTunnelInfo((nabto_tunnel_t)handle, NTI_LAST_ERROR, sizeof(lastError), &lastError);
    return lastError;
}

- (int)nabtoTunnelPort:(NabtoTunnelHandle)handle {
    int port = 0;
    nabtoTunnelInfo((nabto_tunnel_t)handle, NTI_PORT, sizeof(port), &port);
    return port;
}

- (NabtoClientStatus)nabtoTunnelClose:(NabtoTunnelHandle)handle {
    return mapToClientStatus(nabtoTunnelClose((nabto_tunnel_t)handle));
}

- (NabtoClientStatus)nabtoTunnelSetRecvWindowSize:(NabtoTunnelHandle)handle withRecvWindowSize:(int)recvWindowSize {
    return mapToClientStatus(nabtoTunnelSetRecvWindowSize((nabto_tunnel_t)handle, (size_t)recvWindowSize));
}

- (NabtoClientStatus)nabtoTunnelSetSendWindowSize:(NabtoTunnelHandle)handle withSendWindowSize:(int)sendWindowSize {
    return mapToClientStatus(nabtoTunnelSetSendWindowSize((nabto_tunnel_t)handle, (size_t)sendWindowSize));
}

- (NabtoClientStatus)nabtoFree:(void *)p {
    return mapToClientStatus(nabtoFree(p));
}

+ (NSString *)nabtoStatusString:(NabtoClientStatus)status {
    switch(status) {
        case NCS_OK: return @"success";
        case NCS_NO_PROFILE: return @"no profile";
        case NCS_ERROR_READING_CONFIG: return @"error reading config";
        case NCS_API_NOT_INITIALIZED: return @"API not initialized";
        case NCS_INVALID_SESSION: return @"invalid session";
        case NCS_OPEN_CERT_OR_PK_FAILED: return @"open certificate or private key failed";
        case NCS_UNLOCK_PK_FAILED: return @"unlock private key failed";
        case NCS_PORTAL_LOGIN_FAILURE: return @"could not login to portal";
        case NCS_CERT_SIGNING_ERROR: return @"portal failed when signing certificate request";
        case NCS_CERT_SAVING_FAILURE: return @"could not save signed certificate";
        case NCS_ADDRESS_IN_USE: return @"email is already in use";
        case NCS_INVALID_ADDRESS: return @"email is invalid";
        case NCS_NO_NETWORK: return @"no network available";
        case NCS_CONNECT_TO_HOST_FAILED: return @"could not connect to specified host";
        case NCS_STREAMING_UNSUPPORTED: return @"peer does not support streaming";
        case NCS_INVALID_STREAM: return @"an invalid stream handle was specified";
        case NCS_DATA_PENDING: return @"unacknowledged stream data pending";
        case NCS_BUFFER_FULL: return @"all stream data slots are full";
        case NCS_FAILED: return @"unknown error";
        case NCS_INVALID_TUNNEL: return @"an invalid tunnel handle was specified";
        case NCS_ILLEGAL_PARAMETER: return @"a parameter to a function is not supported";
        case NCS_INVALID_RESOURCE: return @"an invalid asynchronous resource was specified";
        case NCS_ERROR_CODE_COUNT: return @"number of possible error codes";
        default: return @"(unknown api status)";
    }
}

+ (NSString *)nabtoTunnelInfoString:(NabtoTunnelState)status {
    switch(status) {
        case NTS_CLOSED: return @"closed";
        case NTS_CONNECTING: return @"connecting...";
        case NTS_READY_FOR_RECONNECT: return @"ready for reconnect";
        case NTS_UNKNOWN: return @"unknown connection";
        case NTS_LOCAL: return @"local";
        case NTS_REMOTE_P2P: return @"remote P2P";
        case NTS_REMOTE_RELAY: return @"remote relay";
        case NTS_REMOTE_RELAY_MICRO: return @"remote relay micro";
        default: return @"(unknown tunnel state)";
    }
}

- (id)init {
    self = [super init];
    return self;
}

- (void)dealloc {
    NSAssert(YES, @"Dealloc on Manager singleton should never be called!");
}

@end
