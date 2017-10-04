/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 *
 * .mm extension important to force xcode to link C++ runtime as needed by Nabto SDK lib
 */

#import "NabtoClient.h"

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
    });
    return instance_;
}

void simulatorSymlinkDocDir() {
#if TARGET_OS_SIMULATOR
    NSString* homeDirectory = [[NSProcessInfo processInfo] environment][@"SIMULATOR_HOST_HOME"];
    NSURL *documentsDirectory = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject];
    NSString *documentsDirectoryPath = documentsDirectory.path;
    NSString *simlinkPath = [homeDirectory stringByAppendingFormat:@"/SimulatorDocuments"];
    unlink(simlinkPath.UTF8String);
    symlink(documentsDirectoryPath.UTF8String, simlinkPath.UTF8String);
#endif
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

- (nabto_status_t)nabtoStartup {
    @synchronized(self) {
        if (initialized_) {
            return NABTO_OK;
        }
        initialized_ = YES;
    }
    simulatorSymlinkDocDir();

    NSString* dir = [self getHomeDir];
    nabto_status_t status = nabtoStartup([dir UTF8String]);
    if (status != NABTO_OK) {
        NSLog(@"Error setting home dir");
        return status;
    }
    nabtoSetOption("dnsHints", "stun.nabto.net,global.cloud.nabto.com,cn-north-1.cloud.nabto.com");

#if NABTOLOG
    nabtoRegisterLogCallback(nabtoLogCallback);
#endif

    return status;
}

- (nabto_status_t)nabtoSetOption:(NSString *)name withValue:(NSString *)value {
    return nabtoSetOption([name UTF8String], [value UTF8String]);
}

- (nabto_status_t)nabtoShutdown {
    @synchronized(self) {
        initialized_ = false;
    }
    [self nabtoCloseSession];
    return nabtoShutdown();
    return NABTO_OK;
}

- (nabto_status_t)nabtoInstallDefaultStaticResources:(NSString *)resourceDir {
    if (!resourceDir) {
        resourceDir = [self getHomeDir];
    }
    return nabtoInstallDefaultStaticResources([resourceDir UTF8String]);
}

- (nabto_status_t)nabtoSetStaticResourceDir:(NSString *)resourceDir {
    return nabtoSetStaticResourceDir([resourceDir UTF8String]);
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

- (nabto_status_t)nabtoOpenSession:(NSString *)email withPassword:(NSString *)password {
    @synchronized (self) {
        return nabtoOpenSession(&session_, [email UTF8String], [password UTF8String]);
    }
}

- (nabto_status_t)nabtoCreateProfile:(NSString *)email withPassword:(NSString *)password {
    return nabtoCreateProfile([email UTF8String], [password UTF8String]);
}

- (nabto_status_t)nabtoCreateSelfSignedProfile:(NSString *)email withPassword:(NSString *)password {
    return nabtoCreateSelfSignedProfile([email UTF8String], [password UTF8String]);
}

- (nabto_status_t)nabtoSignup:(NSString *)email withPassword:(NSString *)password {
    return nabtoSignup([email UTF8String], [password UTF8String]);
}

- (nabto_status_t)nabtoResetAccountPassword:(NSString *)email {
    return nabtoResetAccountPassword([email UTF8String]);
}

- (nabto_status_t)nabtoRemoveProfile:(NSString *)id {
    return nabtoRemoveProfile([id UTF8String]);
}

- (nabto_status_t)nabtoGetFingerprint:(NSString *)certificateId withResult:(char[16])result {
    return nabtoGetFingerprint([certificateId UTF8String], result);
}


- (nabto_status_t)nabtoOpenSessionGuest {
    NSString *email = @"guest";
    NSString *password = @"";
    return [self nabtoOpenSession:email withPassword:password];
}

- (nabto_status_t)nabtoCloseSession {
    @synchronized (self) {
        return nabtoCloseSession(session_);
        session_ = nil;
    }
}

- (nabto_status_t)nabtoSetBasestationAuthJson:(NSString *)jsonKeyValuePairs {
    @synchronized (self) {
        return nabtoSetBasestationAuthJson(session_, [jsonKeyValuePairs UTF8String]);
    }
}

- (nabto_status_t)nabtoFetchUrl:(NSString *)url withResultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLength mimeType:(char **)mimeType {
    @synchronized (self) {
        return nabtoFetchUrl(session_, [url UTF8String], resultBuffer, resultLength, mimeType);
    }
}

- (nabto_status_t)nabtoRpcInvoke:(NSString *)url withResultBuffer:(char **)jsonResponse {
    @synchronized (self) {
        return nabtoRpcInvoke(session_, [url UTF8String], jsonResponse);
    }
}

- (nabto_status_t)nabtoRpcSetDefaultInterface:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage {
    @synchronized (self) {
        return nabtoRpcSetDefaultInterface(session_, [interfaceDefinition UTF8String], errorMessage);
    }
}


- (nabto_status_t)nabtoRpcSetInterface:(NSString *)host withInterfaceDefinition:(NSString *)interfaceDefinition withErrorMessage:(char **)errorMessage {
    @synchronized (self) {
        return nabtoRpcSetInterface(session_, [host UTF8String], [interfaceDefinition UTF8String], errorMessage);
    }
}

- (nabto_status_t)nabtoSubmitPostData:(NSString *)url withBuffer:(NSString *)postBuffer resultBuffer:(char **)resultBuffer resultLength:(size_t *)resultLen mimeType:(char **)mimeType {
    @synchronized (self) {
        return nabtoSubmitPostData(session_, [url UTF8String], [postBuffer UTF8String], [postBuffer length], "", resultBuffer, resultLen, mimeType);
    }
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
    @synchronized (self) {
        if (nabtoGetSessionToken(session_, buffer, size, &resLen) == NABTO_OK && resLen <= size) {
            buffer[resLen] = 0;
            return [NSString stringWithCString:buffer encoding:NSASCIIStringEncoding];
        } else {
            return NULL;
        }
    }
}

- (nabto_status_t)nabtoTunnelOpenTcp:(nabto_tunnel_t *)handle toHost:(NSString *)host onPort:(int)port {
    @synchronized (self) {
        return nabtoTunnelOpenTcp(handle, session_, 0, [host UTF8String], "127.0.0.1", port);
    }
}

- (int)nabtoTunnelVersion:(nabto_tunnel_t)handle {
    int version = 0;
    nabtoTunnelInfo(handle, NTI_VERSION, sizeof(version), &version);
    return version;
}

- (nabto_tunnel_state_t)nabtoTunnelInfo:(nabto_tunnel_t)handle {
    nabto_tunnel_state_t state = NTCS_CLOSED;
    nabtoTunnelInfo(handle, NTI_STATUS, sizeof(state), &state);
    return state;
}

- (int)nabtoTunnelError:(nabto_tunnel_t)handle {
    int lastError = -1;
    nabtoTunnelInfo(handle, NTI_LAST_ERROR, sizeof(lastError), &lastError);
    return lastError;
}

- (int)nabtoTunnelPort:(nabto_tunnel_t)handle {
    int port = 0;
    nabtoTunnelInfo(handle, NTI_PORT, sizeof(port), &port);
    return port;
}

- (nabto_status_t)nabtoTunnelClose:(nabto_tunnel_t)handle {
    return nabtoTunnelClose(handle);
}

- (nabto_status_t)nabtoFree:(void *)p {
    return nabtoFree(p);
}

+ (NSString *)nabtoStatusString:(nabto_status_t)status {
    switch(status) {
        case NABTO_OK: return @"success";
        case NABTO_NO_PROFILE: return @"no profile";
        case NABTO_ERROR_READING_CONFIG: return @"error reading config";
        case NABTO_API_NOT_INITIALIZED: return @"API not initialized";
        case NABTO_INVALID_SESSION: return @"invalid session";
        case NABTO_OPEN_CERT_OR_PK_FAILED: return @"open certificate or private key failed";
        case NABTO_UNLOCK_PK_FAILED: return @"unlock private key failed";
        case NABTO_PORTAL_LOGIN_FAILURE: return @"could not login to portal";
        case NABTO_CERT_SIGNING_ERROR: return @"portal failed when signing certificate request";
        case NABTO_CERT_SAVING_FAILURE: return @"could not save signed certificate";
        case NABTO_ADDRESS_IN_USE: return @"email is already in use";
        case NABTO_INVALID_ADDRESS: return @"email is invalid";
        case NABTO_NO_NETWORK: return @"no network available";
        case NABTO_CONNECT_TO_HOST_FAILED: return @"could not connect to specified host";
        case NABTO_STREAMING_UNSUPPORTED: return @"peer does not support streaming";
        case NABTO_INVALID_STREAM: return @"an invalid stream handle was specified";
        case NABTO_DATA_PENDING: return @"unacknowledged stream data pending";
        case NABTO_BUFFER_FULL: return @"all stream data slots are full";
        case NABTO_FAILED: return @"unknown error";
        case NABTO_INVALID_TUNNEL: return @"an invalid tunnel handle was specified";
        case NABTO_ILLEGAL_PARAMETER: return @"a parameter to a function is not supported";
        case NABTO_INVALID_RESOURCE: return @"an invalid asynchronous resource was specified";
        case NABTO_ERROR_CODE_COUNT: return @"number of possible error codes";
        default: return @"?";
    }
}

+ (NSString *)nabtoTunnelInfoString:(nabto_tunnel_state_t)status {
    switch(status) {
        case NTCS_CLOSED: return @"closed";
        case NTCS_CONNECTING: return @"connecting...";
        case NTCS_READY_FOR_RECONNECT: return @"ready for reconnect";
        case NTCS_UNKNOWN: return @"unknown connection";
        case NTCS_LOCAL: return @"local";
        case NTCS_REMOTE_P2P: return @"remote P2P";
        case NTCS_REMOTE_RELAY: return @"remote relay";
        case NTCS_REMOTE_RELAY_MICRO: return @"remote relay micro";
        default: return @"?";
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
