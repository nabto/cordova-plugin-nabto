/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>

@interface CDVNabto : CDVPlugin {}

- (void)startup:(CDVInvokedUrlCommand*)command;
- (void)shutdown:(CDVInvokedUrlCommand*)command;
- (void)fetchUrl:(CDVInvokedUrlCommand*)command;
- (void)getSessionToken:(CDVInvokedUrlCommand*)command;
- (void)getLocalDevices:(CDVInvokedUrlCommand*)command;
- (void)version:(CDVInvokedUrlCommand*)command;

@end
