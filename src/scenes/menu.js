var isLoggedIn = false;

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

        helper.addUITextToLayer(this, 'САПЁР',        size.height*0.25, size.height*0.8);

        helper.addUITextToLayer(this, '2015 © zeird', size.height*0.03, size.height*0.02);

        return true;
    }
});

var LoginLayer = cc.Layer.extend({
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        cc.audioEngine.stopAllEffects();
        cc.audioEngine.stopMusic();

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
                sender.parent.changeLayer(MenuLayer);
            }
        };

        helper.addUITextToLayer(this, 'Логин:',  size.height*0.06, size.height*0.65);

        var loginEditBox = new cc.EditBoxFixed(cc.size(size.width*0.25, size.height*0.1), helper.createS9TileFromRes(res.empty_png));
        loginEditBox.setAdjustBackgroundImage(false);
        loginEditBox.fontName = loginEditBox.placeHolderFontName = 'Impact';
        loginEditBox.fontSize = loginEditBox.placeHolderFontSize = size.height*0.04;
        loginEditBox.placeHolder = 'логин';
        loginEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        loginEditBox.setPosition(cc.p(size.width*0.5, size.height*0.57));
        loginEditBox.setDelegate(loginLayerEditBoxDelegate);

        this.addChild(loginEditBox);

        helper.addUITextToLayer(this, 'Пароль:', size.height*0.06, size.height*0.45);

        var passwordEditBox = new cc.EditBoxFixed(cc.size(size.width*0.25, size.height*0.1), helper.createS9TileFromRes(res.empty_png));
        passwordEditBox.setAdjustBackgroundImage(false);
        passwordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        passwordEditBox.fontName = passwordEditBox.placeHolderFontName = 'Impact';
        passwordEditBox.fontSize = passwordEditBox.placeHolderFontSize = size.height*0.04;
        passwordEditBox.placeHolder = 'пароль';
        passwordEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        passwordEditBox.setPosition(cc.p(size.width*0.5, size.height*0.37));
        passwordEditBox.setDelegate(loginLayerEditBoxDelegate);

        this.addChild(passwordEditBox);

        var enterButton = helper.addButtonToLayer(this, 'Войти', size.height*0.25, true);
        helper.addMouseUpActionToControlButton(enterButton, function(target, event) { if (helper.isMouseEventOnItsTarget(event)) { target.parent.changeLayer(MenuLayer); } });

        cc.audioEngine.playEffect(res.login_page_sound);

        return true;
    },
    changeLayer: function(aLayer) {
        this.parent.addChild(new aLayer());
        this.removeFromParent();
    }
});

var MenuLayer = cc.Layer.extend({
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        cc.audioEngine.stopAllEffects();
        cc.audioEngine.stopMusic();

        // ask the window size
        var size = cc.winSize;

        isLoggedIn = true;

        var newGameButton = helper.addButtonToLayer(this, 'Новая игра', size.height*0.6);
        helper.addMouseUpActionToControlButton(newGameButton, function(target, event) { if (helper.isMouseEventOnItsTarget(event)) { helper.changeSceneTo(GameScene); } });
        var exitButton = helper.addButtonToLayer(this, 'Выйти', size.height*0.45);
        helper.addMouseUpActionToControlButton(exitButton, function(target, event) { if (helper.isMouseEventOnItsTarget(event)) { target.parent.changeLayer(LoginLayer); } });

        cc.audioEngine.setMusicVolume(0.25);
        cc.audioEngine.playMusic(res.menu_music, true);

        return true;
    },
    changeLayer: function(aLayer) {
        this.parent.addChild(new aLayer());
        this.removeFromParent();
    }
});

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        this.addChild(new BackgroundLayer(cc.color(32, 32, 32)));
        if (!isLoggedIn) {
            this.addChild(new LoginLayer());
        } else {
            this.addChild(new MenuLayer());
        }
    }
});
