#import "AdManager.h"
#import "AdTimeProvider.h"

#define AD_GRACE_PERIOD_SECONDS 15

@implementation AdManager {
    id <AdTimeProvider> timeProvider_;
    long timeLastShown_;
    BOOL hasFreeDevice_;
    BOOL adShownSinceClear_;
    BOOL adShownSinceBoot_;
    NSMutableSet* knownDevices_;
    NSRegularExpression* freeRe_;
}

+ (id)instance {
    static AdManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[self alloc] init];
    });
    return instance;
}

-(id) init {
    self = [super init];
    if (self) {
        return [self initWithTimeProvider:nil];
    } else {
        return nil;
    }
}

-(id) initWithTimeProvider:(id <AdTimeProvider>)timeProvider {
    self = [super init];
    if (self) {
        knownDevices_ = [[NSMutableSet alloc] init];
        if (!timeProvider) {
            timeProvider = [[AdSystemTimeProvider alloc] init];
        }
        timeProvider_ = timeProvider;
        NSError* error;
        freeRe_ = [NSRegularExpression regularExpressionWithPattern:@"^[\\w]+\\.[\\w]{5}f(\\.[\\w]+)*$"
                                                            options:0
                                                              error:&error];
        NSAssert(!error, @"Bad free regex");
        return self;
    } else {
        return nil;
    }
}

-(void) clear {
    [knownDevices_ removeAllObjects];
    hasFreeDevice_ = NO;
    adShownSinceClear_ = NO;
}

-(void) confirmAdShown {
    timeLastShown_ = [timeProvider_ now];
    adShownSinceClear_ = YES;
    adShownSinceBoot_ = YES;
}

-(void) checkForFreeAndAdd:(NSArray*) hosts {
    [hosts enumerateObjectsUsingBlock:^(id host, NSUInteger idx, BOOL *stop) {
        if (!hasFreeDevice_ && [freeRe_ numberOfMatchesInString:host
                                                        options:0
                                                          range:NSMakeRange(0, [host length])]) {
            hasFreeDevice_ = YES;
        }
        [knownDevices_ addObject:host];
    }];
}

-(bool) addDevicesFromString:(NSString*)jsonDeviceList {
    NSError *jsonError;
    NSData* data = [jsonDeviceList dataUsingEncoding:NSUTF8StringEncoding];
    id parsed = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
    if (parsed == nil) {
        NSLog(@"Could not parse input");
        return false;
    } else if ([parsed isKindOfClass: [NSArray class]]) {
        if (hasFreeDevice_) {
            [knownDevices_ addObjectsFromArray:parsed];
        } else {
            [self checkForFreeAndAdd:parsed];
        }
        return true;
    } else {
        NSLog(@"Expected array");
        return false;
    }

}

-(bool) addDevices:(id)list {
    if ([self isInsideGracePeriod]) {
        // according to rules in amp-78, if inside the grace period, we should consider prep as if the user has returned to the app after clicking on an ad
        adShownSinceClear_ = YES;
    }
    if ([list isKindOfClass: [NSArray class]]) {
        [self checkForFreeAndAdd:list];
        return YES;
    } else if ([list isKindOfClass: [NSString class]]) {
        return [self addDevicesFromString:list];
    } else {
        NSLog(@"Unexpected type of list input: %@", NSStringFromClass([list class]));
        return false;
    }
}

-(bool) isInsideGracePeriod {
    return adShownSinceBoot_ && ([timeProvider_ now] - timeLastShown_ < AD_GRACE_PERIOD_SECONDS);
}

-(bool) shouldShowAd {
    NSLog(@"shouldShowAd: hasFree=%d, adShownSinceClear=%d, adShownSinceBoot=%d, isInsideGracePeriod=%d",
          hasFreeDevice_, adShownSinceClear_, adShownSinceBoot_, [self isInsideGracePeriod]);
        return hasFreeDevice_ && !adShownSinceClear_ && ![self isInsideGracePeriod];
}

-(bool) isHostInUrlKnown:(NSString*)urlString {
    NSURL* url = [NSURL URLWithString:urlString];
    NSString* host = [url host];
    bool res = [knownDevices_ containsObject:host];
    NSLog(@"isHostInUrlKnown returns [%d] for [%@] in [%@]", res, host, urlString);
    return res;
}

@end
