/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

#import "CDVNabto.h"
#import "Manager.h"

@implementation CDVNabto

- (void)startup:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* res = nil;

        nabto_status_t status = [[Manager sharedManager] nabtoStartup];
        if (status != NABTO_OK) {
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
        }
        else {
            status = [[Manager sharedManager] nabtoOpenSession:[command.arguments objectAtIndex:0] withPassword:[command.arguments objectAtIndex:1]];
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

- (void)shutdown:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *res = nil;

        nabto_status_t status = [[Manager sharedManager] nabtoShutdown];
        if (status == NABTO_OK) {
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        }
        else {
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
        }
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
    }];
}

- (void)fetchUrl:(CDVInvokedUrlCommand*)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *res = nil;

        nabto_status_t status;
        char *resultBuffer = 0;
        size_t resultLen = 0;
        char *resultMimeType = 0;

        status = [[Manager sharedManager] nabtoFetchUrl:[command.arguments objectAtIndex:0] withResultBuffer:&resultBuffer resultLength:&resultLen mimeType:&resultMimeType];
        if (status == NABTO_OK) {
            NSData *data = [NSData dataWithBytes:resultBuffer length:resultLen];
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]];
        }
        else {
            res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:status];
        }

        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
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

@end
