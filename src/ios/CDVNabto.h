/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>
#import "IsShowingAd.h"

@interface CDVNabto : CDVPlugin <IsShowingAd> {
}


@property (atomic, assign, getter=isShowingAd) BOOL showingAd;

/* Nabto API */
- (void)setOption:(CDVInvokedUrlCommand*)command;
- (void)setLocalConnectionPsk:(CDVInvokedUrlCommand*)command;
- (void)setBasestationAuthJson:(CDVInvokedUrlCommand*)command;
- (void)shutdown:(CDVInvokedUrlCommand*)command;
- (void)createSignedKeyPair:(CDVInvokedUrlCommand*)command;
- (void)signup:(CDVInvokedUrlCommand*)command;
- (void)resetAccountPassword:(CDVInvokedUrlCommand*)command;
- (void)createKeyPair:(CDVInvokedUrlCommand*)command;
- (void)removeKeyPair:(CDVInvokedUrlCommand*)command;
- (void)getFingerprint:(CDVInvokedUrlCommand*)command;
- (void)rpcSetDefaultInterface:(CDVInvokedUrlCommand*)command;
- (void)rpcSetInterface:(CDVInvokedUrlCommand*)command;
- (void)rpcInvoke:(CDVInvokedUrlCommand*)command;
- (void)prepareInvoke:(CDVInvokedUrlCommand*)command;
- (void)fetchUrl:(CDVInvokedUrlCommand*)command;
- (void)getSessionToken:(CDVInvokedUrlCommand*)command;
- (void)getLocalDevices:(CDVInvokedUrlCommand*)command;
- (void)version:(CDVInvokedUrlCommand*)command;
- (void)bindToWifi:(CDVInvokedUrlCommand*)command;
- (void)clearWifiBinding:(CDVInvokedUrlCommand*)command;

/* Nabto Tunnel API */
- (void)tunnelOpenTcp:(CDVInvokedUrlCommand*)command;
- (void)tunnelVersion:(CDVInvokedUrlCommand*)command;
- (void)tunnelState:(CDVInvokedUrlCommand*)command;
- (void)tunnelLastError:(CDVInvokedUrlCommand*)command;
- (void)tunnelPort:(CDVInvokedUrlCommand*)command;
- (void)tunnelClose:(CDVInvokedUrlCommand*)command;
- (void)tunnelSetSendWindowSize:(CDVInvokedUrlCommand*)command;
- (void)tunnelSetRecvWindowSize:(CDVInvokedUrlCommand*)command;

/* Ad functionallity */
- (void)showAd;
- (UIViewController*) topMostController;


@end
