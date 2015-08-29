var INITIALIZED = false;

var HelloWorldLayer = cc.Layer.extend({
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        var menuItemFontScene2 = new cc.MenuItemFont("Start", PushScene);

        var menu = new cc.Menu(menuItemFontScene2);
        menu.alignItemsVertically();
        this.addChild(menu);

        cc.audioEngine.playEffect(res.app_start_sound); //returns soundEffect id

        return true;
    }
});

var PushScene = function() {
    var scene = new HelloWorldScene2();
    cc.director.pushScene(scene);
};

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        if (!INITIALIZED) {
            INITIALIZED = true;
            var layer = new HelloWorldLayer();
            this.addChild(layer);
        }
    }
});
