#import "AdHelper.h"
#import "AdTimeProvider.h"

@implementation AdHelper

#define AD_GRACE_PERIOD_SECONDS 15

id <AdTimeProvider> timeProvider_;
long timeLastShown_;

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
        if (!timeProvider) {
            timeProvider = [[AdSystemTimeProvider alloc] init];
        }
        timeProvider_ = timeProvider;
        return self;
    } else {
        return nil;
    }
}

-(bool) isOutsideGracePeriod {
    return ([timeProvider_ now] - timeLastShown_ > AD_GRACE_PERIOD_SECONDS);
}

-(bool) isFreeDevice {
    return false;
}

-(bool) prepareInvoke:(NSString*)jsonDeviceList {
    // TODO: parse json
    // TODO: iterate through devices and invoke each of below
    return [self isFreeDevice] && [self isOutsideGracePeriod];
}

-(bool) allowInvoke:(NSString*)url {
    return false;
}

@end
