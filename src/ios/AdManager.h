#import <Foundation/Foundation.h>
#import "AdTimeProvider.h"

@interface AdManager : NSObject {
}

// access singleton instance
+ (id)instance;

// clear all state
-(void) clear;

// add devices to known set of devices, returns true iff input is a valid string
// with a json array (["foo", "bar", "baz"]) OR an NSArray of strings (Cordova apparently
// transforms input JSON to NSArray in some versions)
-(bool) addDevices:(id)jsonDeviceList;

// indicate ad was shown to initiate new grace period
- (void)confirmAdShown;

// returns true iff an ad must be shown based on the currently known devices (following the rules specified in amp-78)
-(bool) shouldShowAd;

// returns true iff host in url has been added
-(bool) isHostInUrlKnown:(NSString*)url;

// inject time stub for test
-(id) initWithTimeProvider:(id <AdTimeProvider>)timeProvider;


@end


