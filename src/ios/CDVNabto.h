/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>

@interface CDVNabto : CDVPlugin {}

/* Nabto API */
- (void)startup:(CDVInvokedUrlCommand*)command;
- (void)shutdown:(CDVInvokedUrlCommand*)command;
- (void)fetchUrl:(CDVInvokedUrlCommand*)command;
- (void)getSessionToken:(CDVInvokedUrlCommand*)command;
- (void)getLocalDevices:(CDVInvokedUrlCommand*)command;
- (void)version:(CDVInvokedUrlCommand*)command;

/* Nabto Tunnel API */
- (void)tunnelOpenTcp:(CDVInvokedUrlCommand*)command;
- (void)tunnelVersion:(CDVInvokedUrlCommand*)command;
- (void)tunnelState:(CDVInvokedUrlCommand*)command;
- (void)tunnelLastError:(CDVInvokedUrlCommand*)command;
- (void)tunnelPort:(CDVInvokedUrlCommand*)command;
- (void)tunnelClose:(CDVInvokedUrlCommand*)command;

@end
