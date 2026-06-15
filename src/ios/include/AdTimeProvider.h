#import <Foundation/Foundation.h>

@protocol AdTimeProvider <NSObject>
-(long) now;
@end

@interface AdSystemTimeProvider : NSObject <AdTimeProvider>
-(long) now;
@end

