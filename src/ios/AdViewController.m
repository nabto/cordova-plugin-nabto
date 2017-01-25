/*
 * Copyright (C) 2008-2016 Nabto - All Rights Reserved.
 */

#import "AdViewController.h"


@implementation AdViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    NSString *path = [[NSBundle mainBundle] pathForResource:@"ad" ofType:@"png"];
    _image = [[UIImage alloc] initWithContentsOfFile:path];
    _imageView = [[UIImageView alloc]initWithFrame:self.view.bounds];
    [_imageView setImage:_image];
    [_imageView setContentMode:UIViewContentModeScaleAspectFill];
    [_imageView setClipsToBounds:YES];
    [self.view addSubview:_imageView];
    [self performSelector:@selector(dissmissViewController) withObject:self afterDelay:5];

}

-(void)dissmissViewController{
    NSLog(@"dissmissViewController");

    [self dismissViewControllerAnimated:YES completion:nil];
    if(self.CDV != nil) {
        [self.CDV setShowingAd:NO];
    }
}

// ...

@end

