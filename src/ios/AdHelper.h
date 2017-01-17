#import <Foundation/Foundation.h>
#import "AdTimeProvider.h"

@interface AdHelper : NSObject {
}

-(id) initWithTimeProvider:(id <AdTimeProvider>)timeProvider;

// returns true iff an ad must be shown (following the rules specified in amp-78)
-(bool) prepareInvoke:(NSString*)jsonDeviceList;

-(bool) allowInvoke:(NSString*)url;

@end
