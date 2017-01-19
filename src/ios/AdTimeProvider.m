#import "AdTimeProvider.h"

@implementation AdSystemTimeProvider

-(long) now {
    return (long)time(NULL);
}

@end

