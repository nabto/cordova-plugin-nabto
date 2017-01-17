//
//  tests.m
//  tests
//
//  Created by Nabto on 1/17/17.
//  Copyright © 2017 Nabto. All rights reserved.
//

#import <XCTest/XCTest.h>
#import "../../AdHelper.h"

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
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    XCTAssertTrue([ah addDevices:@"[\"foo\", \"bar\"]"]);
}

- (void)testRejectsValidJsonMap {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    XCTAssertFalse([ah addDevices:@"{\"foo\": \"bar\"]}"]);
}

- (void)testRejectsInvalidValidJson {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    XCTAssertFalse([ah addDevices:@"foo"]);
}

- (void)testShouldNotShowAdInsideGracePeriod {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    [ah addDevices:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"];
    XCTAssertFalse([ah shouldShowAd]);
}

- (void)testShouldShowAdOutsideGracePeriod {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:17]];
    [ah addDevices:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"];
    XCTAssertTrue([ah shouldShowAd]);
}

- (void)testShouldNotShowAdForOnlyNonFreeDevices {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:17]];
    [ah addDevices:@"[\"paid1.aaaaa.appmyproduct.com\", \"paid2.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([ah shouldShowAd]);
}

- (void)testShouldShowAdForMixedPaidAndFreeDevices {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:17]];
    [ah addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertTrue([ah shouldShowAd]);
}

- (void)testConfirmAdShownRestartsGracePeriod {
    StubTimeProvider* time = [[StubTimeProvider alloc] initWithTime:7];
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:time];
    [ah addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];

    // during initial grace period
    XCTAssertFalse([ah shouldShowAd]);
    
    // after grace period
    [time setTime:17];
    XCTAssertTrue([ah shouldShowAd]);
    [ah confirmAdShown];

    // during next grace period
    [time setTime:22];
    XCTAssertFalse([ah shouldShowAd]);

    // after next grace period
    [time setTime:40];
    XCTAssertTrue([ah shouldShowAd]);
}

- (void)testAddedDevicesAreKnown {
    AdHelper* ah = [[AdHelper alloc] init];
    [ah addDevices:@"[\"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertTrue([ah isHostInUrlKnown:@"nabto://free.aaaaaf.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertTrue([ah isHostInUrlKnown:@"nabto://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertTrue([ah isHostInUrlKnown:@"foo://paid.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertFalse([ah isHostInUrlKnown:@"nabto://foo.aaaaa.appmyproduct.com/wind_speed.json?foo=bar"]);
}

- (void)testInvalidUrls {
    AdHelper* ah = [[AdHelper alloc] init];
    [ah addDevices:@"[\"\", \"hello, world!\", \"free.aaaaaf.appmyproduct.com\", \"paid.aaaaa.appmyproduct.com\"]"];
    XCTAssertFalse([ah isHostInUrlKnown:@"free.aaaaaf.appmyproduct.com/wind_speed.json?foo=bar"]);
    XCTAssertFalse([ah isHostInUrlKnown:@"nabto://"]);
    XCTAssertFalse([ah isHostInUrlKnown:@""]);
    XCTAssertFalse([ah isHostInUrlKnown:@"hello, world!"]);
}


@end
