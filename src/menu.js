var layer, t, s;

var createUIText = function(aString, aFontSize) {
    var t = new ccui.Text();
    t.attr({
        textAlign: cc.TEXT_ALIGNMENT_CENTER,
        string: aString,
        fontName: 'Impact',
        fontSize: aFontSize
    });
    t.enableOutline(cc.color(0, 0, 0), aFontSize*0.15);

    return t;
};

var addUITextToLayer = function(aLayer, aString, aFontSize, aY) {
    var t = createUIText(aString, aFontSize);
    t.attr({
        x: cc.winSize.width*0.5,
        y: aY
    });

    aLayer.addChild(t);

    return t;
};

var createS9TileFromRes = function(aRes) {
    return cc.Scale9Sprite.create(aRes, cc.rect(0, 0, 110, 110), cc.rect(25, 25, 65, 65));
};

var isTouchOnTarget = function(touch, target) {
    var locationInNode = target.convertToNodeSpace(touch.getLocation());
    var s = target.getContentSize();
    var rect = cc.rect(0, 0, s.width, s.height);

    return cc.rectContainsPoint(rect, locationInNode);
};

var createControlButton = function(aString) {
    var size = cc.winSize;

    var b = new cc.ControlButton();
    b.setBackgroundSpriteForState(createS9TileFromRes(res.up_l_png), cc.CONTROL_STATE_NORMAL);
    b.setBackgroundSpriteForState(createS9TileFromRes(res.down_l_png), cc.CONTROL_STATE_HIGHLIGHTED);
    b.setBackgroundSpriteForState(createS9TileFromRes(res.up_png), cc.CONTROL_STATE_DISABLED);
    b.setPreferredSize(cc.size(size.width*0.25, size.height*0.13));
    b.setAnchorPoint(cc.p(0.5, 0.5));
    b.setPosition(cc.p(size.width*0.5, size.height*0.25));
    b.setTitleForState(aString, cc.CONTROL_STATE_NORMAL);
    b.setTitleTTFForState('Impact', cc.CONTROL_STATE_NORMAL);
    b.setTitleTTFSizeForState(size.height*0.07, cc.CONTROL_STATE_NORMAL);
    b.setTitleColorForState(cc.color(170,170,170), cc.CONTROL_STATE_DISABLED);
    b.setEnabled(false);

    return b;
};

var addControlButtonToLayer = function(aLayer, aString) {
    var b = createControlButton(aString);
    aLayer.addChild(b);

    return b;
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
        //this.addChild(background_menu_mine, 0);

        var infinite_rotate = new cc.RepeatForever(cc.RotateBy.create(60, 360));
        background_menu_mine.runAction(infinite_rotate);

        addUITextToLayer(this, 'САПЁР',        size.height*0.25, size.height*0.8);

        addUITextToLayer(this, '2015 © zeird', size.height*0.03, size.height*0.02);

        return true;
    }
});

var LoginLayer = cc.Layer.extend({
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        var loginLayerEditBoxDelegate = new cc.EditBoxDelegate();
        loginLayerEditBoxDelegate.editBoxTextChanged = function(sender, text) {
            if (loginEditBox.string && passwordEditBox.string) {
                if (!enterButton.enabled) {
                    enterButton.setEnabled(true);
                }
            } else if (enterButton.enabled) {
                enterButton.setEnabled(false);
            }
        };
        loginLayerEditBoxDelegate.editBoxReturn = function(sender) {
            if (loginEditBox.string && passwordEditBox.string) {
                cc.log('here?');
                sender.parent.changeLayer(BlankLayer);
            }
        };

        addUITextToLayer(this, 'Логин:',  size.height*0.06, size.height*0.65);

        var loginEditBox = new cc.EditBox(cc.size(size.width*0.25, size.height*0.1), createS9TileFromRes(res.down_png));
        loginEditBox.setAdjustBackgroundImage(false);
        loginEditBox.fontName = loginEditBox.placeHolderFontName = 'Impact';
        loginEditBox.fontSize = loginEditBox.placeHolderFontSize = size.height*0.04;
        loginEditBox.placeHolder = 'логин';
        loginEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        loginEditBox.setPosition(cc.p(size.width*0.5, size.height*0.57));
        loginEditBox.setDelegate(loginLayerEditBoxDelegate);

        this.addChild(loginEditBox);

        addUITextToLayer(this, 'Пароль:', size.height*0.06, size.height*0.45);

        var passwordEditBox = new cc.EditBox(cc.size(size.width*0.25, size.height*0.1), createS9TileFromRes(res.down_png));
        passwordEditBox.setAdjustBackgroundImage(false);
        passwordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        passwordEditBox.fontName = passwordEditBox.placeHolderFontName = 'Impact';
        passwordEditBox.fontSize = passwordEditBox.placeHolderFontSize = size.height*0.04;
        passwordEditBox.placeHolder = 'пароль';
        passwordEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        passwordEditBox.setPosition(cc.p(size.width*0.5, size.height*0.37));
        passwordEditBox.setDelegate(loginLayerEditBoxDelegate);

        this.addChild(passwordEditBox);

        var enterButton = addControlButtonToLayer(this, 'Войти');

        var listener1 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function(touch, event) {
                var target = event.getCurrentTarget();

                if (isTouchOnTarget(touch, target) && target.isEnabled()) {
                    cc.log("sprite began...");//" x = " + locationInNode.x + ", y = " + locationInNode.y);
                    target.setHighlighted(true);
                    return true;
                }
                return false;
            },
            onTouchMoved: function(touch, event) {
                var target = event.getCurrentTarget();

                if (isTouchOnTarget(touch, target)) {
                    if (target.isHighlighted() === false) {
                        target.setHighlighted(true);
                    }
                } else {
                    if (target.isHighlighted() === true) {
                        target.setHighlighted(false);
                    }
                }
            },
            onTouchEnded: function(touch, event) {
                var target = event.getCurrentTarget();
                cc.log("sprite onTouchesEnded.. ");
                if (isTouchOnTarget(touch, target)) {
                    target.setHighlighted(false);
                    target.parent.changeLayer(BlankLayer);

                }
            }
        });

        cc.eventManager.addListener(listener1, enterButton);

        cc.audioEngine.playEffect(res.login_page_sound);

        return true;
    },
    changeLayer: function(aLayer) {
        cc.log('changing LoginLayer to another');
        this.parent.addChild(new aLayer());
        this.removeFromParent();
    }
});

var PushScene = function() {
    INITIALIZED = false;
    var scene = new HelloWorldScene2();
    cc.director.runScene(new cc.TransitionFade(0.5, scene));
};

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var isLoggedIn = false;
        this.addChild(new BackgroundLayer(cc.color(32, 32, 32)));
        if (!isLoggedIn) {
            layer = new LoginLayer();
            this.addChild(layer);
        } else {
            layer = new MenuLayer();
            this.addChild(layer);
        }
    }
});
