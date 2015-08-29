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
        //this.addChild(menu);

        var button = new ccui.Button();
        button.loadTextures(res.one, res.onex);
        button.x = size.width/2;
        button.y = size.height/2;
        button.addTouchEventListener(this.touchEvent, this);
        this.addChild(button);

        cc.audioEngine.playEffect(res.app_start_sound); //returns soundEffect id

        //this.schedule(this.functionCallback);

        return true;
    },
    touchEvent: function(sender, type) {
        switch(type) {
        case ccui.Widget.TOUCH_BEGAN: cc.log(sender); break;
        case ccui.Widget.TOUCH_MOVED: cc.log('MOVED'); break;
        case ccui.Widget.TOUCH_ENDED: cc.log('ENDED'); sender.loadTextures(res.two, res.twox); this.scheduleOnce(PushScene, 1); break;
        case ccui.Widget.TOUCH_CANCELLED: cc.log('CANCELLED'); break;
        }
    }
    //this.functionCallback:function() {
    //
    //}
});

var PushScene = function() {
    INITIALIZED = false;
    var scene = new HelloWorldScene2();
    cc.director.runScene(new cc.TransitionFade(0.5, scene));
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
