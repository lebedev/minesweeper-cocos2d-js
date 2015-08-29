var debug;

var addUITextToLayer = function(aLayer, aString, aFontSize, aY) {
    var uiText = new ccui.Text(),
        size = cc.winSize;
    uiText.attr({
        textAlign: cc.TEXT_ALIGNMENT_CENTER,
        string: aString,
        fontName: 'Impact',
        fontSize: aFontSize,
        x: size.width*0.5,
        y: aY
    });
    uiText.enableOutline(cc.color(0, 0, 0), aFontSize*0.15);

    aLayer.addChild(uiText);

    return uiText;
};

var BackgroundLayer = cc.LayerColor.extend({
    ctor: function(aColor) {
        //////////////////////////////
        // 1. super init first
        this._super();

        this.setColor(aColor);

        // ask the window size
        var size = cc.winSize;

        var background_menu_mine = new cc.Sprite(res.background_menu_mine_png);
        background_menu_mine.setAnchorPoint(cc.p(0.5, 0.5));
        background_menu_mine.setPosition(cc.p(size.width/2, size.height/2));
        this.addChild(background_menu_mine, 0);

        var infinite_rotate = new cc.RepeatForever(cc.RotateBy.create(60, 360));
        background_menu_mine.runAction(infinite_rotate);

        addUITextToLayer(this, 'САПЁР',        size.height*0.25, size.height*0.8);

        addUITextToLayer(this, '2015 © ZEIRD', size.height*0.03, size.height*0.02);

        return true;
    }
});

var LoginLayer = cc.Layer.extend({
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

        if (cc.sys.capabilities.hasOwnProperty('mouse')) {
            cc.eventManager.addListener(
                {
                    event: cc.EventListener.MOUSE,
                    onMouseDown: function(event) {
                        cc.log('down at X=' + event.getLocationX() + ' Y=' + event.getLocationY() + ' button ' + event.getButton());
                        if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                            cc.log('left down at X=' + event.getLocationX());
                            ResumeMusic();
                        } else if (event.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                            cc.log('right down at Y=' + event.getLocationY());
                            PauseMusic();
                        }
                    },
                    onMouseUp: function(event) {
                        if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                            cc.log('left up at X=' + event.getLocationX());
                        } else if (event.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                            cc.log('right up at Y=' + event.getLocationY());
                        }
                    },
                    onMouseMove: function(event) {
                        cc.log('move at X=' + event.getLocationX() + ' Y=' + event.getLocationY() + ' button ' + event.getButton());
                        var target = event.getCurrentTarget();
                        var locationInNode = target.convertToNodeSpace(event.getLocation());
                        var s = target.getContentSize();
                        var rect = cc.rect(0, 0, s.width, s.height);

                        if (cc.rectContainsPoint(rect, locationInNode)) {
                            cc.log("It's hovering! x = " + locationInNode.x + ", y = " + locationInNode.y);
                            target.opacity = 180;
                            return true;
                        } else {
                          target.opacity = 255;
                          return false;
                        }
                    },
                },
                button
            );
        }

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

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var background_layer = new BackgroundLayer(cc.color(32, 32, 32));
        this.addChild(background_layer);
    }
});
