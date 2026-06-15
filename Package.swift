// swift-tools-version:5.9

import PackageDescription

// Cordova (cordova-ios 8+) consumes this package when the iOS platform is
// declared with package="swift" in plugin.xml. The package name and the product
// name below must match the plugin id ("cordova-plugin-nabto") so that
// cordova-ios can wire the plugin into the application's Swift package.
let package = Package(
    name: "cordova-plugin-nabto",
    platforms: [
        .iOS(.v14)
    ],
    products: [
        .library(name: "cordova-plugin-nabto", targets: ["CDVNabto"])
    ],
    dependencies: [
        // cordova-ios is referenced here only so the plugin resolves when built
        // standalone (swift build). When cordova integrates the plugin it rewrites
        // this line to a local path dependency on the app's vendored cordova-ios
        // (see cordova-ios lib/SwiftPackage.js), so the requirement below is just a
        // placeholder. A version range can't be used because cordova-ios publishes
        // only "rel/X.Y.Z" git tags, which SwiftPM does not treat as semver.
        .package(url: "https://github.com/apache/cordova-ios.git", branch: "master"),
        // Legacy Nabto 4/Micro client (the SPM distribution of the NabtoClient
        // library that was previously consumed via the CocoaPods "NabtoClient" pod).
        .package(url: "https://github.com/nabto/nabto-ios-client.git", from: "8.0.1")
    ],
    targets: [
        .target(
            name: "CDVNabto",
            dependencies: [
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "NabtoClient", package: "nabto-ios-client")
            ],
            path: "src/ios",
            // src/ios/res holds a resource delivered to the app via the
            // <resource-file> tag in plugin.xml; it must not be compiled into the
            // plugin target. (The former sample/test Xcode projects that were also
            // excluded here have been removed from the repo.)
            exclude: [
                "res"
            ],
            sources: [
                "CDVNabto.m",
                "AdManager.m",
                "AdTimeProvider.m",
                "AdViewController.m"
            ],
            // The public headers live in their own include/ subdirectory. SPM treats the
            // module-named header (CDVNabto.h) as an umbrella header and rejects any sibling
            // directories next to it; isolating the headers in include/ keeps the umbrella
            // header away from the sample projects and res/ that sit at the src/ios root.
            publicHeadersPath: "include"
        )
    ]
)
