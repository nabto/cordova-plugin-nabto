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
        .package(url: "https://github.com/apache/cordova-ios.git", branch: "master"),
        // Legacy Nabto 4/Micro client (the SPM distribution of the NabtoClient
        // library that was previously consumed via the CocoaPods "NabtoClient" pod).
        .package(url: "https://github.com/nabto/nabto-ios-client.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "CDVNabto",
            dependencies: [
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "NabtoClient", package: "nabto-ios-client")
            ],
            path: "src/ios",
            // src/ios also holds sample/test Xcode projects and a resource that is
            // delivered to the app via the <resource-file> tag in plugin.xml; none
            // of these should be compiled as part of the plugin target.
            exclude: [
                "AmpAdHelperTest",
                "PluginTester",
                "res",
                ".npmignore"
            ],
            sources: [
                "CDVNabto.m",
                "AdManager.m",
                "AdTimeProvider.m",
                "AdViewController.m"
            ],
            publicHeadersPath: "."
        )
    ]
)
