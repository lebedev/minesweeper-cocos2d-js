var layer, textf;

var createUIText = function(aString, aFontSize) {
    var uiText = new ccui.Text();
    uiText.attr({
        textAlign: cc.TEXT_ALIGNMENT_CENTER,
        string: aString,
        fontName: 'Impact',
        fontSize: aFontSize
    });
    uiText.enableOutline(cc.color(0, 0, 0), aFontSize*0.15);

    return uiText;
};

var addUITextToLayer = function(aLayer, aString, aFontSize, aY) {
    var uiText = createUIText(aString, aFontSize);
    uiText.attr({
        x: cc.winSize.width*0.5,
        y: aY
    });

    aLayer.addChild(uiText);

    return uiText;
};

var createS9TileFromRes = function(aRes) {
    return cc.Scale9Sprite.create(aRes, cc.rect(0, 0, 110, 110), cc.rect(25, 25, 65, 65));
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

        addUITextToLayer(this, 'Логин:',  size.height*0.06, size.height*0.65);

        var loginEditBox = new cc.EditBox(cc.size(size.width*0.25, size.height*0.1), createS9TileFromRes(res.down_png));
        loginEditBox.setAdjustBackgroundImage(false);
        loginEditBox.fontName = loginEditBox.placeHolderFontName = 'Impact';
        loginEditBox.fontSize = loginEditBox.placeHolderFontSize = size.height*0.04;
        loginEditBox.placeHolder = 'логин';
        loginEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        loginEditBox.setPosition(cc.p(size.width*0.5, size.height*0.57));
        loginEditBox.setDelegate(this);
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
        passwordEditBox.setDelegate(this);
        passwordEditBox;
        this.addChild(passwordEditBox);



        var enterButton = new cc.ControlButton();
        enterButton.setBackgroundSpriteForState(createS9TileFromRes(res.up_png), cc.CONTROL_STATE_INITIAL);
        enterButton.setBackgroundSpriteForState(createS9TileFromRes(res.one), cc.CONTROL_STATE_NORMAL);
        enterButton.setBackgroundSpriteForState(createS9TileFromRes(res.down_l_png), cc.CONTROL_STATE_HIGHLIGHTED);
        enterButton.setBackgroundSpriteForState(createS9TileFromRes(res.two), cc.CONTROL_STATE_SELECTED);
        enterButton.setBackgroundSpriteForState(createS9TileFromRes(res.up_png), cc.CONTROL_STATE_DISABLED);
        enterButton.setPreferredSize(cc.size(size.width*0.25, size.height*0.13));
        enterButton.setAnchorPoint(cc.p(0.5, 0.5));
        enterButton.setPosition(cc.p(size.width*0.5, size.height*0.2));
        txt = createUIText('Войти', size.height*0.04);
        //enterButton.setTitleForState('Войти', cc.CONTROL_STATE_NORMAL);
        //enterButton.setTitleColorForState(cc.color(170,170,170), cc.CONTROL_STATE_DISABLED);
        //enterButton.setTitleTTFForState('Impact', cc.CONTROL_STATE_NORMAL);
        //enterButton.setTitleTTFSizeForState(size.height*0.04, cc.CONTROL_STATE_NORMAL);
        //enterButton.setTitleLabelForState(txt, cc.CONTROL_STATE_NORMAL);
        textf = enterButton;
        this.addChild(enterButton);

        cc.audioEngine.playEffect(res.login_page_sound);

        return true;
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
        }
    }
});

var test = function(a,b,c) {
    try{
    textf.removeFromParent();
    var size = cc.winSize;
    var enterButton = new cc.ControlButton(a, b, c);
    enterButton.setAnchorPoint(cc.p(0.5, 0.5));
    enterButton.setPosition(cc.p(size.width*0.5, size.height*0.27));
    textf = enterButton;
    layer.addChild(enterButton);
    }catch(e) {
        cc.log(e);
    }
}