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

        helper.addSoundAndMusicButtons(this);

        return true;
    }
});

var LoginLayer = cc.Layer.extend({
    _login: '',
    _password: '',
    _errorUIText: null,
    SHOW_HIDE_ACTION: new cc.Sequence(new cc.FadeIn(1), new cc.FadeOut(1)),
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
            this._login = loginEditBox.string;
            this._password = passwordEditBox.string;
            if (this._login && this._password) {
                if (!enterButton.enabled) {
                    enterButton.setEnabled(true);
                }
            } else if (enterButton.enabled) {
                enterButton.setEnabled(false);
            }
        }.bind(this);
        loginLayerEditBoxDelegate.editBoxReturn = function(sender) {
            if (this._login && this._password) {
                this._doLogin();
            }
        }.bind(this);

        helper.addUITextToLayer(this, 'Логин:',  size.height*0.06, size.height*0.65);

        var loginEditBox = new cc.EditBoxFixed(cc.size(size.width*0.3, size.height*0.1), helper.createS9TileFromRes(res.editbox_png, true));
        loginEditBox.setAdjustBackgroundImage(false);
        loginEditBox.fontName = loginEditBox.placeHolderFontName = 'Impact';
        loginEditBox.fontSize = loginEditBox.placeHolderFontSize = size.height*0.04;
        loginEditBox.placeHolder = 'логин';
        loginEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        loginEditBox.setPosition(cc.p(size.width*0.5, size.height*0.57));
        loginEditBox.setDelegate(loginLayerEditBoxDelegate);

        this.addChild(loginEditBox);

        helper.addUITextToLayer(this, 'Пароль:', size.height*0.06, size.height*0.45);

        var passwordEditBox = new cc.EditBoxFixed(cc.size(size.width*0.3, size.height*0.1), helper.createS9TileFromRes(res.editbox_png, true));
        passwordEditBox.setAdjustBackgroundImage(false);
        passwordEditBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_PASSWORD);
        passwordEditBox.fontName = passwordEditBox.placeHolderFontName = 'Impact';
        passwordEditBox.fontSize = passwordEditBox.placeHolderFontSize = size.height*0.04;
        passwordEditBox.placeHolder = 'пароль';
        passwordEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        passwordEditBox.setPosition(cc.p(size.width*0.5, size.height*0.37));
        passwordEditBox.setDelegate(loginLayerEditBoxDelegate);

        this.addChild(passwordEditBox);

        var enterButton = helper.addButtonToLayer(this, 'Войти/создать', size.height*0.25, true);
        enterButton.setPreferredSize(cc.size(size.width*0.3, size.height*0.13));
        helper.addMouseUpActionTo(enterButton, function() { this._doLogin.call(this); }.bind(this));

        this._errorUIText = helper.addUITextToLayer(this, '',  size.height*0.06, size.height*0.1);
        this._errorUIText.setColor(cc.color(225,0,0));
        this._errorUIText.setOpacity(0);

        cc.audioEngine.playEffect(res.login_page_sound);

        return true;
    },
    _doLogin: function() {
        var responseRaw = server.sendAction({
            action: 'login',
            login: this._login,
            password: this._password
        });
        var response = JSON.parse(responseRaw);
        if (response.status === 'error') {
            this._showError(response.error);
        } else if (response.status === 'OK') {
            for (key in response.player) {
                sessionStorage[key] = response.player[key];
            }
            this.parent.addChild(new MenuLayer());
            this.removeFromParent();
        }
    },
    _showError: function(aErrorText) {
        this._errorUIText.string = aErrorText;
        this._errorUIText.stopAllActions();
        this._errorUIText.runAction(this.SHOW_HIDE_ACTION);
    }
});

var OptionsLayer = cc.Layer.extend({
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        var optionsLayerEditBoxDelegate = new cc.EditBoxDelegate();
        optionsLayerEditBoxDelegate.editBoxTextChanged = function(sender, text) {
            cc.log(columnsEditBox.string, rowsEditBox.string, minesEditBox.string);
            if (!isNaN(columnsEditBox.string) && +columnsEditBox.string >= 9 && +columnsEditBox.string <= 50 &&
                !isNaN(rowsEditBox.string) && +rowsEditBox.string >= 9 && +rowsEditBox.string <= 50 &&
                !isNaN(minesEditBox.string) && +minesEditBox.string > 0 && +minesEditBox.string < 1000) {
                if (!saveButton.enabled) {
                    saveButton.enabled = true;
                }
            } else if (saveButton.enabled) {
                saveButton.enabled = false;
            }
        };
        optionsLayerEditBoxDelegate.editBoxReturn = function(sender) {
            if (!isNaN(columnsEditBox.string) && +columnsEditBox.string >= 9 && +columnsEditBox.string <= 50 &&
                !isNaN(rowsEditBox.string) && +rowsEditBox.string >= 9 && +rowsEditBox.string <= 50 &&
                !isNaN(minesEditBox.string) && +minesEditBox.string > 0 && +minesEditBox.string < 1000) {
                icolumns = +columnsEditBox.string;
                irows = +rowsEditBox.string;
                imines = +minesEditBox.string;
                sender.parent.changeLayer(MenuLayer);
            }
        };

        var columnsUIText = helper.addUITextToLayer(this, 'Столбцов:',  size.height*0.06, size.height*0.57);
        columnsUIText.setPositionX(size.width*0.12);

        var columnsEditBox = new cc.EditBoxFixed(cc.size(size.width*0.06, size.height*0.1), helper.createS9TileFromRes(res.editbox_png, true));
        columnsEditBox.setAdjustBackgroundImage(false);
        columnsEditBox.fontName = columnsEditBox.placeHolderFontName = 'Impact';
        columnsEditBox.fontSize = columnsEditBox.placeHolderFontSize = size.height*0.04;
        columnsEditBox.placeHolder = columnsEditBox.string = +sessionStorage.last_columns_value;
        columnsEditBox.setMaxLength(2);
        columnsEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        columnsEditBox.setPosition(cc.p(size.width*0.24, size.height*0.575));
        columnsEditBox.setDelegate(optionsLayerEditBoxDelegate);

        this.addChild(columnsEditBox);

        var rowsUIText = helper.addUITextToLayer(this, 'Строк:', size.height*0.06, size.height*0.57);
        rowsUIText.setPositionX(size.width*0.45);

        var rowsEditBox = new cc.EditBoxFixed(cc.size(size.width*0.06, size.height*0.1), helper.createS9TileFromRes(res.editbox_png, true));
        rowsEditBox.setAdjustBackgroundImage(false);
        rowsEditBox.fontName = rowsEditBox.placeHolderFontName = 'Impact';
        rowsEditBox.fontSize = rowsEditBox.placeHolderFontSize = size.height*0.04;
        rowsEditBox.placeHolder = rowsEditBox.string = +sessionStorage.last_rows_value;
        rowsEditBox.setMaxLength(2);
        rowsEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        rowsEditBox.setPosition(cc.p(size.width*0.55, size.height*0.575));
        rowsEditBox.setDelegate(optionsLayerEditBoxDelegate);

        this.addChild(rowsEditBox);

        var minesUIText = helper.addUITextToLayer(this, 'Мин:', size.height*0.06, size.height*0.57);
        minesUIText.setPositionX(size.width*0.8);

        var minesEditBox = new cc.EditBoxFixed(cc.size(size.width*0.072, size.height*0.1), helper.createS9TileFromRes(res.editbox_png, true));
        minesEditBox.setAdjustBackgroundImage(false);
        minesEditBox.fontName = minesEditBox.placeHolderFontName = 'Impact';
        minesEditBox.fontSize = minesEditBox.placeHolderFontSize = size.height*0.04;
        minesEditBox.placeHolder = minesEditBox.string = +sessionStorage.last_mines_value;
        minesEditBox.setMaxLength(3);
        minesEditBox.setAnchorPoint(cc.p(0.5, 0.5));
        minesEditBox.setPosition(cc.p(size.width*0.9, size.height*0.575));
        minesEditBox.setDelegate(optionsLayerEditBoxDelegate);

        this.addChild(minesEditBox);

        var saveButton = helper.addButtonToLayer(this, 'Сохранить', size.height*0.4);
        helper.addMouseUpActionTo(saveButton, function(event) {
            sessionStorage.last_columns_value = +columnsEditBox.string;
            sessionStorage.last_rows_value = +rowsEditBox.string;
            sessionStorage.last_mines_value = +minesEditBox.string;
            server.sendAction({ action: 'update_value', login: sessionStorage.login, password: sessionStorage.password, name: 'last_columns_value', value: sessionStorage.last_columns_value });
            server.sendAction({ action: 'update_value', login: sessionStorage.login, password: sessionStorage.password, name: 'last_rows_value', value: sessionStorage.last_rows_value });
            server.sendAction({ action: 'update_value', login: sessionStorage.login, password: sessionStorage.password, name: 'last_mines_value', value: sessionStorage.last_mines_value });
            event.getCurrentTarget().parent.changeLayer(MenuLayer);
        });

        var cancelButton = helper.addButtonToLayer(this, 'Отмена', size.height*0.25);
        helper.addMouseUpActionTo(cancelButton, function(event) { event.getCurrentTarget().parent.changeLayer(MenuLayer); });

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

        // ask the window size
        var size = cc.winSize;

        isLoggedIn = true;

        helper.setVolume(helper.soundButton, 'sound');
        helper.setVolume(helper.musicButton, 'music');

        var newGameButton = helper.addButtonToLayer(this, 'Новая игра', size.height*0.55);
        helper.addMouseUpActionTo(newGameButton, function(event) { helper.changeSceneTo(GameScene); });
        var optionsButton = helper.addButtonToLayer(this, 'Настройки', size.height*0.4);
        helper.addMouseUpActionTo(optionsButton, function(event) { event.getCurrentTarget().parent.changeLayer(OptionsLayer); });
        var exitButton = helper.addButtonToLayer(this, 'Выйти', size.height*0.25);
        helper.addMouseUpActionTo(exitButton, function(event) { sessionStorage.clear(); event.getCurrentTarget().parent.changeLayer(LoginLayer); });

        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.playMusic(res.menu_music, true);
        }

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

        var isLoggedIn = sessionStorage.login && sessionStorage.password;

        this.addChild(new BackgroundLayer(cc.color(32, 32, 32)));
        if (!isLoggedIn) {
            this.addChild(new LoginLayer());
        } else {
            this.addChild(new MenuLayer());
        }
    }
});
