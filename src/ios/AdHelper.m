#import "AdHelper.h"
#import "AdTimeProvider.h"

#define AD_GRACE_PERIOD_SECONDS 15

@implementation AdHelper {
    id <AdTimeProvider> timeProvider_;
    long timeLastShown_;
    BOOL hasFreeDevice_;
    NSMutableSet* knownDevices_;
    NSRegularExpression* freeRe_;
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
        hasFreeDevice_ = NO;
        NSError* error;
        freeRe_ = [NSRegularExpression regularExpressionWithPattern:@"^[\\w]+\\.[\\w]{5}f(\\.[\\w]+)*$"
                                                            options:NSRegularExpressionCaseInsensitive
                                                              error:&error];
        NSAssert(!error, @"Bad free regex");
        return self;
    } else {
        return nil;
    }
}

-(void) confirmAdShown {
    timeLastShown_ = [timeProvider_ now];
}

-(bool) isOutsideGracePeriod {
    return ([timeProvider_ now] - timeLastShown_ > AD_GRACE_PERIOD_SECONDS);
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

-(bool) addDevices:(NSString*)jsonDeviceList {
    NSError *jsonError;
    NSData* data = [jsonDeviceList dataUsingEncoding:NSUTF8StringEncoding];
    id parsed = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
    if (parsed == nil)
    {
        NSLog(@"Could not parse input");
        return false;
    }
    else if ([parsed isKindOfClass: [NSArray class]])
    {
        if (hasFreeDevice_) {
            [knownDevices_ addObjectsFromArray:parsed];
        } else {
            [self checkForFreeAndAdd:parsed];
        }
        return true;
    }
    else
    {
        NSLog(@"Expected array");
        return false;
    }
}

-(bool) shouldShowAd {
    return hasFreeDevice_ && [self isOutsideGracePeriod];
}

-(bool) isHostInUrlKnown:(NSString*)urlString {
    NSURL* url = [NSURL URLWithString:urlString];
    NSString* host = [url host];
    return [knownDevices_ containsObject:host];
}

@end
