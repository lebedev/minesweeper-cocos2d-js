
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

        cc.audioEngine.playEffect(res.app_start_sound);

        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

