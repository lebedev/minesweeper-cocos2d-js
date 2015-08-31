var ev;

var GameLayer = cc.Layer.extend({
    TILE_STATE_CLOSED: 0,
    TILE_STATE_CLOSED_FLAG: 1,
    TILE_STATE_EMPTY: 2,
    TILE_STATE_NUMBER: 3,
    TILE_STATE_MINE: 4,
    _deltas: [
        [-1, -1],  [0, -1], [+1, -1],
        [-1,  0],/*[x,  y]*/[+1,  0],
        [-1, +1],  [0, +1], [+1, +1],
    ],
    _game_started: false,
    _minefield_tiles: null,
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        cc.audioEngine.stopAllEffects();
        cc.audioEngine.stopMusic();

        // ask the window size
        var size = cc.winSize;

        isLoggedIn = true;

        var returnButton = helper.addButtonToLayer(this, "В меню", size.height*0.05);
        returnButton.setTitleTTFSizeForState(size.height*0.04, cc.CONTROL_STATE_NORMAL);
        returnButton.setPreferredSize(cc.size(size.width*0.25, size.height*0.08));
        helper.addMouseUpActionToControlButton(returnButton, function() { helper.changeSceneTo(MenuScene); });

        this.createBlankMineField();

        return true;
    },
    addFlagTo: function(aTile) {
        data = aTile.getUserData();
        aTile.setUserData({ x: data.x, y: data.y, state: this.TILE_STATE_CLOSED_FLAG });
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_flag_png), cc.CONTROL_STATE_NORMAL);
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_flag_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);
    },
    changeStateOf: function(aTile) {
        var texture, state,
            data = aTile.getUserData(),
            value = mines.askValueOf(data.x, data.y);
        switch(value) {
        case '*': {
            texture = res.mine_wrong_png;
            state = this.TILE_STATE_MINE;
            break;
        }
        case   0: {
            texture = res.empty_png;
            state = this.TILE_STATE_EMPTY;
            break;
        }
        default : {
            texture = res['number_' + value + '_png'];
            state = this.TILE_STATE_NUMBER;
            break;
        }}
        aTile.setUserData({ x: data.x, y: data.y, state: state });
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(texture), cc.CONTROL_STATE_NORMAL);
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(texture), cc.CONTROL_STATE_HIGHLIGHTED);
        if (state === this.TILE_STATE_EMPTY) {
            this.runActionOnSurroundingsOf(data.x, data.y);
        }
    },
    createBlankMineField: function() {
        mines.clearMineField();
        if (this._minefield_tiles) {
            var old_rows = this._minefield_tiles.length,
                old_columns = this._minefield_tiles[0].length;
            for (var i = 0; i < old_rows; i++) {
                for (var j = 0; j < old_columns; j++) {
                    this._minefield_tiles[i][j].removeFromParent();
                    this._minefield_tiles[i][j] = null;
                }
                this._minefield_tiles[i] = null;
            }
            this._minefield_tiles = null;
        }

        var tile, row,
            rows = 9,
            columns = 9,
            size = cc.winSize,
            tile_size = Math.min(size.width*0.8/columns, size.height*0.8/rows),
            x_offset = (size.width  - tile_size*columns)/2,
            y_offset = (size.height + tile_size*rows)/2,
            selfPointer = this;
        this._minefield_tiles = [];
        for (var i = 0; i < rows; i++) {
            row = [];
            for (var j = 0; j < columns; j++) {
                tile = helper.addTileToLayer(this, size.height/2);
                tile.setUserData({ x: j, y: i, state: this.TILE_STATE_CLOSED });
                tile.setPreferredSize(cc.size(tile_size, tile_size));
                tile.setPosition(cc.p(x_offset + (j + 0.5)*tile_size, y_offset - (i + 0.5)*tile_size));
                tile.setZoomOnTouchDown(false);

                tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_png), cc.CONTROL_STATE_NORMAL);
                tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);

                helper.addMouseMoveActionToControlButton(tile, function(target, isOver) {
                    if (isOver) {
                        if (!target.isHighlighted()) {
                            target.setHighlighted(true);
                        }
                    } else {
                        if (target.isHighlighted()) {
                            target.setHighlighted(false);
                        }
                    }
                });
                helper.addMouseDownActionToControlButton(tile, function(target, event) {
                    if (event.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                        var data = target.getUserData();
                        if (data.state === selfPointer.TILE_STATE_CLOSED) {
                            selfPointer.addFlagTo(target);
                        } else if (data.state === selfPointer.TILE_STATE_CLOSED_FLAG) {
                            selfPointer.removeFlagFrom(target);
                        }
                    } else if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                        var data = target.getUserData();
                        if (data.state === selfPointer.TILE_STATE_CLOSED) {
                            target.setBackgroundSpriteForState(helper.createS9TileFromRes(res.empty_png), cc.CONTROL_STATE_NORMAL);
                            //target.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);
                        }
                    }
                });

                helper.addMouseUpActionToControlButton(tile, function(target, event) {
                    if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                        var data = target.getUserData();
                        if (!selfPointer._game_started) {
                            selfPointer._game_started = true;
                            selfPointer.setMineFieldState(cc.p(data.x, data.y));
                        }
                        if (data.state === selfPointer.TILE_STATE_CLOSED) {
                            selfPointer.changeStateOf(target);
                        }
                    }
                });

                row.push(tile);
            }
            this._minefield_tiles.push(row);
        }
    },
    removeFlagFrom: function(aTile) {
        var data = aTile.getUserData();
        aTile.setUserData({ x: data.x, y: data.y, state: this.TILE_STATE_CLOSED });
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_png), cc.CONTROL_STATE_NORMAL);
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);
    },
    runActionOnSurroundingsOf: function(aX, aY) {
        var x, y;
        for (var i = 0; i < 8; i++) {
            x = aX + this._deltas[i][0];
            y = aY + this._deltas[i][1];
            if (this._minefield_tiles[y] !== undefined && this._minefield_tiles[y][x] !== undefined && this._minefield_tiles[y][x].getUserData().state === this.TILE_STATE_CLOSED) {
                this.changeStateOf(this._minefield_tiles[y][x]);
            }
        }
    },
    setMineFieldState: function(aPoint) {
        var tile, texture, rows = this._minefield_tiles.length,
            columns = this._minefield_tiles[0].length,
            size = cc.winSize,
            tile_size = Math.min(size.width*0.8/columns, size.height*0.8/rows),
            x_offset = (size.width  - tile_size*columns)/2,
            y_offset = (size.height - tile_size*rows)/2;
        mines.createMineField(columns, rows, 10, aPoint.x, aPoint.y);
        mines.showMineField();
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});
