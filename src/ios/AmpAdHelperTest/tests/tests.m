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
@end

@implementation tests

- (void)setUp {
    [super setUp];
}

- (void)tearDown {
    [super tearDown];
}

- (void)testShouldNotShowAdInsideGracePeriod {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:7]];
    XCTAssertFalse([ah prepareInvoke:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"]);
}

- (void)testShouldShowAdOutsideGracePeriod {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:17]];
    XCTAssertTrue([ah prepareInvoke:@"[\"free1.aaaaaf.appmyproduct.com\", \"free2.aaaaaf.appmyproduct.com\"]"]);
}

- (void)testShouldNotShowAdForNonFreeDevices {
    AdHelper* ah = [[AdHelper alloc] initWithTimeProvider:[[StubTimeProvider alloc] initWithTime:17]];
    XCTAssertFalse([ah prepareInvoke:@"\"paid1.aaaaa.appmyproduct.com\", \"paid2.aaaaaf.appmyproduct.com\""]);
}

@end
