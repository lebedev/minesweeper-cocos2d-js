var INITIALIZED_2 = false;

var HelloWorldLayer2 = cc.Layer.extend({
    big_mine:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        big_mine = new cc.Sprite(res.big_mine_png);
        big_mine.setAnchorPoint(cc.p(0.5, 0.5));
        big_mine.setPosition(cc.p(size.width/2, size.height/2));
        this.addChild(big_mine, 0);

        var move = new cc.MoveBy(3, cc.p(100, 100));
        big_mine.runAction(move);

        var infinite_rotate = new cc.RepeatForever(cc.RotateBy.create(2, 360));
        big_mine.runAction(infinite_rotate);

        if (!cc.sys.capabilities.hasOwnProperty('mouse')) {
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
                    },
                },
                this
            );
        }

        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener(
                {
                    event: cc.EventListener.KEYBOARD,
                    onKeyPressed: function(key, event) {
                        cc.log('key pressed: ' + key.toString());
                    },
                },
                this
            );
        }

        var menuItemFontPlay = new cc.MenuItemFont("Play", ResumeMusic);
        var menuItemFontPause = new cc.MenuItemFont("Pause", PauseMusic);
        var menuItemFontExit = new cc.MenuItemFont("Exit", PopScene);
        //var menuItemImage = new cc.MenuItemImage(res.mine_png, res.mine_red_png, ResumeMusic);

        var menu = new cc.Menu(menuItemFontPlay, menuItemFontPause, menuItemFontExit);
        menu.alignItemsVertically();
        this.addChild(menu);

        cc.audioEngine.playMusic(res.music, true);
        cc.audioEngine.setMusicVolume(0.25);
        //cc.audioEngine.setEffectsVolume(0-1)
        //cc.audioEngine.stopAllEffects()
        //cc.audioEngine.stopEffect(sound_id)
        //cc.audioEngine.playMusic(musicRes, repeat)
        //cc.audioEngine.stopMusic()
        //this.scheduleOnce(func, seconds)

        return true;
    }
});

var ResumeMusic = function() {
    cc.audioEngine.resumeMusic();
    big_mine.resume();
};

var PauseMusic = function() {
    cc.audioEngine.pauseMusic();
    big_mine.pause();
};

var StopMusic = function() {
    cc.audioEngine.stopMusic();
};

var PopScene = function() {
    INITIALIZED_2 = false;
    StopMusic();
    cc.director.popScene();
};

var HelloWorldScene2 = cc.Scene.extend({
    onEnter:function () {
        this._super();
        if (!INITIALIZED_2) {
            INITIALIZED_2 = true;
            var layer = new HelloWorldLayer2();
            this.addChild(layer);
        }
    }
});
