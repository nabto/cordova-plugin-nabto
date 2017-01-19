//
//  tests.m
//  tests
//
//  Created by Nabto on 1/17/17.
//  Copyright © 2017 Nabto. All rights reserved.
//

#import <XCTest/XCTest.h>
#import "../../AdManager.h"

@interface tests : XCTestCase
@end

@interface StubTimeProvider : NSObject<AdTimeProvider>
-(long) now;
-(id) initWithTime:(long)time;
@end

@implementation StubTimeProvider

long time_;

-(long) now {
    return time_;
}
-(id) initWithTime:(long)time {
    self = [super init];
    time_ = time;
    return self;
}
-(void) setTime:(long) time {
    time_ = time;
}
@end

@implementation tests

- (void)setUp {
    [super setUp];
}

- (void)tearDown {
    [super tearDown];
}

- (void)testAcceptsValidJsonArray {
    AdManager* am = [[AdManager alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    XCTAssertTrue([am addDevices:@"[\"foo\", \"bar\"]"]);
}

- (void)testRejectsValidJsonMap {
    AdManager* am = [[AdManager alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    XCTAssertFalse([am addDevices:@"{\"foo\": \"bar\"]}"]);
}

- (void)testRejectsInvalidValidJson {
    AdManager* am = [[AdManager alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    XCTAssertFalse([am addDevices:@"foo"]);
}

- (void)testNoInitialGracePeriod_1 {
    AdManager* am = [[AdManager alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    [am addDevices:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"];
    XCTAssertTrue([am shouldShowAd]);
}

- (void)testNoInitialGracePeriod_2 {
    AdManager* am = [[AdManager alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:17]];
    [am addDevices:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"];
    XCTAssertTrue([am shouldShowAd]);
}

- (void)testShouldNotShowAdForOnlyNonFreeDevices {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:17];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [time setTime:37];
    [am addDevices:@"[\"paid1.aaaaa.appmyproduct.com\", \"paid2.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([am shouldShowAd]);
}

- (void)testShouldShowAdForMixedPaidAndFreeDevices {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:17];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [time setTime:37];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertTrue([am shouldShowAd]);
}

- (void)testMixedAdd {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:17];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [time setTime:37];
    [am addDevices:@"[\"paid1.aaaaa.appmyproduct.com\", \"paid2.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([am shouldShowAd]);
    [am addDevices:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"];
    XCTAssertTrue([am shouldShowAd]);
    [am addDevices:@"[\"free3.aaaaaf.appmyproduct.com\", \"free4.aaaaaf.appmyproduct.com\"]"]; 
    XCTAssertTrue([am shouldShowAd]);
}

- (void)testInputAsArray {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:17];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [time setTime:37];
    [am addDevices:@[@"paid1.aaaaa.appmyproduct.com", @"paid2.aaaaa.appmyproduct.com"]];
    XCTAssertFalse([am shouldShowAd]);
    [am addDevices:@[@"free1.aaaaaf.appmyproduct.com", @"free2.aaaaaf.appmyproduct.com"]];
    XCTAssertTrue([am shouldShowAd]);
}

- (void)testShouldOnlyShowAdOnce {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:17];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [am addDevices:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"];

    [time setTime:37];

    XCTAssertTrue([am shouldShowAd]);
    [am confirmAdShown];

    [time setTime:173];
    XCTAssertFalse([am shouldShowAd]);

    [time setTime:173000];
    XCTAssertFalse([am shouldShowAd]);
}


- (void)testAddedDevicesAreKnown {
    AdManager* am = [[AdManager alloc] init];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://free.aaaaaf.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertTrue([am isHostInUrlKnown:@"foo://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertFalse([am isHostInUrlKnown:@"nabto://foo.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
}

- (void)testInvalidUrls {
    AdManager* am = [[AdManager alloc] init];
    [am addDevices:@"[\"\", \"hello, world!\", \"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([am isHostInUrlKnown:@"free.aaaaaf.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertFalse([am isHostInUrlKnown:@"nabto://"]);
    XCTAssertFalse([am isHostInUrlKnown:@""]);
    XCTAssertFalse([am isHostInUrlKnown:@"hello, world!"]);
}

- (void)testShouldNotShowAfterClearWithinGrace {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:10];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertTrue([am shouldShowAd]);
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
    [am confirmAdShown];
    
    [am clear];
    
    [time setTime:12];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([am shouldShowAd]);
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
}

- (void)testShouldNeverShowAfterPrepInGraceAfterClear {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:10];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertTrue([am shouldShowAd]);
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
    [am confirmAdShown];
    
    [am clear];
    
    [time setTime:12];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([am shouldShowAd]);
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
}

- (void)testShouldShowAfterClearAfterGraceIfNoPrepInGrace {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:10];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertTrue([am shouldShowAd]);
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
    [am confirmAdShown];
    
    [am clear];
    
    [time setTime:12];
    [am addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([am shouldShowAd]);
    XCTAssertTrue([am isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
}


- (void)testInputThatCrashesPlugin {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:7];
    AdManager* am = [[AdManager alloc] initWithTimeProvider:time];
    NSString* jsonHosts = @"(\"test.amp-o.appmyproduct.com\", \"test.ampstf.appmyproduct.com\")";
    XCTAssertFalse([am addDevices:jsonHosts]);
}

- (void)testInputThatCrashesPlugin_attempt2 {
    NSString* jsonHosts = @"(\"test.amp-o.appmyproduct.com\", \"test.ampstf.appmyproduct.com\")";
    if ([[AdManager instance] addDevices:jsonHosts]) {
        if ([[AdManager instance] shouldShowAd]) {
            [[AdManager instance] confirmAdShown];
        }
    }
}

- (void)testInputThatCrashesPlugin_attempt3 {
    NSArray* jsonHosts = @[@"test.amp-o.appmyproduct.com", @"test.ampstf.appmyproduct.com"];
    if ([[AdManager instance] addDevices:jsonHosts]) {
        if ([[AdManager instance] shouldShowAd]) {
            [[AdManager instance] confirmAdShown];
        }
    }
}


@end
