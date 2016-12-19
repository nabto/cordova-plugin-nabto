/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

#import "CDVNabto.h"
#import "Manager.h"
#import "AdViewController.h"

@implementation CDVNabto

#pragma mark Nabto API

- (void)startup:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* res = nil;

        nabto_status_t status = [[Manager sharedManager] nabtoStartup];
        if (status != NABTO_OK) {
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
        }
        else {
            status = [[Manager sharedManager] nabtoOpenSession:[command.arguments objectAtIndex:0]
                                                  withPassword:[command.arguments objectAtIndex:1]];
            if (status == NABTO_OK) {
                res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            }
            else {
                res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
            }
        }
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
    }];
}

- (void)handleStatus:(nabto_status_t)status withCommand:(CDVInvokedUrlCommand*)command {
    CDVPluginResult *res = nil;
    if (status == NABTO_OK) {
        res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
    }
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

- (void)createKeyPair:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        nabto_status_t status = [[Manager sharedManager]
                                    nabtoCreateSelfSignedProfile:[command.arguments objectAtIndex:0]
                                                    withPassword:[command.arguments objectAtIndex:1]];
        [self handleStatus:status withCommand:command];
    }];
}

- (void)shutdown:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
            nabto_status_t status = [[Manager sharedManager] nabtoShutdown];
            [self handleStatus:status withCommand:command];
    }];
}

- (void)fetchUrl:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *res = nil;

        nabto_status_t status;
        char *resultBuffer = 0;
        size_t resultLen = 0;
        char *resultMimeType = 0;

        status = [[Manager sharedManager] nabtoFetchUrl:[command.arguments objectAtIndex:0]
                                       withResultBuffer:&resultBuffer
                                           resultLength:&resultLen
                                               mimeType:&resultMimeType];
        if (status == NABTO_OK) {
            NSData *data = [NSData dataWithBytes:resultBuffer length:resultLen];
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                    messageAsString:[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]];
            nabtoFree(resultBuffer);
        }
        else {
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
        }

        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
    }];
}

- (void)prepareInvoke:(CDVInvokedUrlCommand*)command {
    NSLog(@"Cordova prepareInvoke begin");
    
    /*
     if devices.length == 0
     return;
     for all devices:
     if device free:
     showAd = true
     Save device to cache
     if device own-it:
     save device to cache
     else device is not AMP
     don't save "this device is not supported"
     end
     if ad has been show within grace period:
     showAd = false
     if showAd && previouslyShownAd = false
     showAd()
     previouslyShownAd = true
     start Timer for grace period
     callback.success();
     */
    
     
    [self showAd];
    
    NSLog(@"Cordova prepareInvoke end");
}

- (void)rpcInvoke:(CDVInvokedUrlCommand*)command {
    NSLog(@"Cordova RPC invoke begin");
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *res = nil;
        NSLog(@"Cordova RPC invoke runInBackground ");
        nabto_status_t status;
        char *jsonString = 0;

        status = [[Manager sharedManager] nabtoRpcInvoke:[command.arguments objectAtIndex:0]
                                        withResultBuffer:&jsonString];
        if (status == NABTO_OK) {
            NSLog(@"Cordova RPC invoke runInBackground done ok");
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                    messageAsString:[NSString stringWithUTF8String:jsonString]];
            nabtoFree(jsonString);
        }
        else {
            NSLog(@"Cordova RPC invoke runInBackground done fail");
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
        }

        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
    }];
}

- (void)rpcSetDefaultInterface:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        nabto_status_t status;
        status = [[Manager sharedManager] nabtoRpcSetDefaultInterface:[command.arguments objectAtIndex:0]
                                                     withErrorMessage:0];

        // TODO: propagate XML parse errors
        [self handleStatus:status withCommand:command];
    }];
}

- (void)rpcSetInterface:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        nabto_status_t status;
        status = [[Manager sharedManager] nabtoRpcSetInterface:[command.arguments objectAtIndex:0]
                                       withInterfaceDefinition:[command.arguments objectAtIndex:1]
                                              withErrorMessage:0];
        // TODO: propagate XML parse errors
        [self handleStatus:status withCommand:command];
    }];
}

- (void)getSessionToken:(CDVInvokedUrlCommand*)command {
    NSString *token = [[Manager sharedManager] nabtoGetSessionToken];
    CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:token];
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

- (void)getLocalDevices:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        NSArray *devices = [[Manager sharedManager] nabtoGetLocalDevices];
        CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:devices];
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
    }];
}

- (void)version:(CDVInvokedUrlCommand*)command {
    NSString *version = [[Manager sharedManager] nabtoVersion];
    CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:version];
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

#pragma mark Nabto Tunnel API

- (void)tunnelOpenTcp:(CDVInvokedUrlCommand*)command {
    CDVPluginResult *res = nil;
    
    nabto_status_t status = [[Manager sharedManager] nabtoTunnelOpenTcp:[command.arguments objectAtIndex:0] onPort:[[command.arguments objectAtIndex:1] intValue]];
    if (status == NABTO_OK) {
        res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    }
    else {
        res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
    }
    
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

- (void)tunnelVersion:(CDVInvokedUrlCommand*)command {
    int version = [[Manager sharedManager] nabtoTunnelVersion];
    CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:version];
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

- (void)tunnelState:(CDVInvokedUrlCommand*)command {
    nabto_tunnel_state_t state = [[Manager sharedManager] nabtoTunnelInfo];
    CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:state];
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

- (void)tunnelLastError:(CDVInvokedUrlCommand*)command {
    nabto_status_t status = [[Manager sharedManager] nabtoTunnelError];
    CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:status];
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

- (void)tunnelPort:(CDVInvokedUrlCommand*)command {
    int port = [[Manager sharedManager] nabtoTunnelPort];
    CDVPluginResult *res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:port];
    [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
}

- (void)tunnelClose:(CDVInvokedUrlCommand*)command {
    nabto_status_t status = [[Manager sharedManager] nabtoTunnelClose];
    [self handleStatus:status withCommand:command];
}

- (void)showAd {
    @synchronized (self) {
        if(![self isShowingAd]) {
           self.showingAd = YES; 
           AdViewController* avc = [[AdViewController alloc] init];
           avc.CDV=self;
           [[self topMostController] presentViewController:avc animated:YES completion:nil];
        } else {
           NSLog(@"Not showing add.. already showing");
        }
    }
    
}

- (UIViewController*) topMostController {
    UIViewController *topController = [UIApplication sharedApplication].keyWindow.rootViewController;

    while (topController.presentedViewController) {
        topController = topController.presentedViewController;
    }

    return topController;
}

@end
