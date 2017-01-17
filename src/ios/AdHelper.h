#import <Foundation/Foundation.h>
#import "AdTimeProvider.h"

@interface AdHelper : NSObject {
}

-(id) initWithTimeProvider:(id <AdTimeProvider>)timeProvider;

// add devices to known set of devices, returns true iff input is a valid json array (["foo", "bar", "baz"])
-(bool) addDevices:(NSString*)jsonDeviceList;

// indicate ad was shown to initiate new grace period
- (void)confirmAdShown;

// returns true iff an ad must be shown based on the currently known devices (following the rules specified in amp-78)
-(bool) shouldShowAd;

// returns true iff host in url has been added
-(bool) isHostInUrlKnown:(NSString*)url;

@end
