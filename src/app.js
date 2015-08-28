
var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        var big_mine = new cc.Sprite.create(res.big_mine_png);
        big_mine.setAnchorPoint(cc.p(0.5, 0.5));
        big_mine.setPosition(cc.p(size.width/2, size.height/2));
        this.addChild(big_mine, 0);

        var move = cc.MoveBy.create(3, cc.p(100, 100));
        big_mine.runAction(move);

        var infinite_rotate = cc.RepeatForever.create(cc.RotateBy.create(2, 360));
        big_mine.runAction(infinite_rotate);

        if (cc.sys.capabilities.hasOwnProperty('mouse')) {
            cc.eventManager.addListener(
                {
                    event: cc.EventListener.MOUSE,
                    onMouseDown: function(event) {
                        if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                            ResumeMusic();
                        } else if (event.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                            PauseMusic();
                        }
                    },
                },
                this
            );
        }

        cc.audioEngine.playEffect(res.app_start_sound); //returns soundEffect id
        cc.audioEngine.playMusic(res.music, true);
        cc.audioEngine.setMusicVolume(0.25);
        PauseMusic();
        //cc.audioEngine.setEffectsVolume(0-1)
        //cc.audioEngine.stopAllEffects()
        //cc.audioEngine.stopEffect(sound_id)
        //cc.audioEngine.playMusic(musicRes, repeat)
        //cc.audioEngine.stopMusic()
        //this.scheduleOnce(func, seconds)

        return true;
    }
});

var PauseMusic = function() {
    cc.audioEngine.pauseMusic();
};

var ResumeMusic = function() {
    cc.audioEngine.resumeMusic();
};

var StopMusic = function() {
    cc.audioEngine.stopMusic();
};

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

