# Cocos2d-JS Single File Engine User Guide

This guide is for the usage of single file engine of Cocos2d-JS which can be retrieved from [the online downloader](http://cocos2d-x.org/filecenter/jsbuilder/).

You may have downloaded one of these three versions:

- **Full Version**: Full Version engine contains all features and all extensions for Cocos2d-JS, it can help you explore its great possibility. You can refer to the feature list in [Cocos2d-JS documentation page](http://www.cocos2d-x.org/docs/manual/framework/html5/en)

- **Cocos2d-JS Lite Version**: Lite Version contains some core features of Cocos2d-JS, it's extremely easy to use and light as a feather. Its features are listing below:
    + Canvas renderer (No WebGL support)
    + Scene and Layers
    + Event Manager
    + Scheduler
    + Sprite and Texture2D
    + LabelTTF
    + Audio
    + Actions
    + Menu and MenuItems

- **Customized Version**: Customize your own version of Cocos2d-JS with the features you need, you should know the meaning of these features to construct a suitable version. All the features you chose will be included in the downloaded engine js file.

## Usage

The usage have been demonstrated in the downloaded package, you can see the cocos2d-js-v3.0[-lite].js is embeded in the HelloWorld.html, after the window loading you will be able to use Cocos2d-JS API in your custom js code.

You need to host these files on a web server or local web server to see the result.

## Useful links

- [Online API reference](http://www.cocos2d-x.org/reference/html5-js/V3.0/index.html)
- [Downloadable API Reference](http://www.cocos2d-x.org/filedown/Cocos2d-JS-v3.0-API.zip)
- [Document root](http://cocos2d-x.org/docs/manual/framework/html5/en)
- [Github repository](https://github.com/cocos2d/cocos2d-js)
- [Online forum](http://discuss.cocos2d-x.org/category/javascript)
- [Online test cases](http://cocos2d-x.org/js-tests/)

## About Closure Compiler

You can use [Google Closure Compiler](https://developers.google.com/closure/compiler/) to compress all js files to a smaller size even if you downloaded the compressed version. Steps are showing below:

1. Download Closure Compiler's jar app
2. Configure the build.xml with your own configurations
3. Run `ant` in the terminal
4. Replace the embeded js files in HelloWorld.html with the single output file `game.min.js`

Please be noticed that you can not write any js code in your html file, all js codes should be compressed at the same time, otherwise errors will be triggered.