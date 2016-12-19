/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "IsShowingAd.h"

@interface AdViewController : UIViewController

{
    NSArray *_pArray;
    UIImage *_image;
    UIImageView *_imageView;
}

@property id <IsShowingAd> CDV;


-(void)dissmissViewController;


@end
