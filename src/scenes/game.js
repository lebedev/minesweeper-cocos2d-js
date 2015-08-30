var GameLayer = cc.Layer.extend({
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        var text = new ccui.Text();
        text.attr({
            textAlign: cc.TEXT_ALIGNMENT_CENTER,
            string: 'Game Scene',
            x: size.width/2,
            y: size.height/2,
        });

        this.addChild(text);

        return true;
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});
