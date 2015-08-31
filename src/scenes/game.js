var irows = 9, icolumns = 9, imines = 10;

var GameLayer = cc.Layer.extend({
    TILE_STATE_CLOSED:                      0,
    TILE_STATE_CLOSED_WITH_EMPTY_HIGHLIGHT: 1,
    TILE_STATE_CLOSED_FLAG:                 2,
    TILE_STATE_EMPTY:                       3,
    TILE_STATE_NUMBER:                      4,
    TILE_STATE_MINE_EXPLODED:               5,
    TILE_STATE_MINE:                        6,
    TILE_STATE_MINE_DEFUSED:                7,
    TILE_STATE_FLAG_WRONG:                  8,
    _deltas: [
        [-1, -1],  [0, -1], [+1, -1],
        [-1,  0],/*[x,  y]*/[+1,  0],
        [-1, +1],  [0, +1], [+1, +1],
    ],
    _game_started: false,
    _minefield_tiles: null,
    _tiles_total: null,
    _mines_count: null,
    _opened_tiles: null,
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        cc.audioEngine.stopAllEffects();
        cc.audioEngine.stopMusic();

        cc.audioEngine.setEffectsVolume(0.5);

        // ask the window size
        var size = cc.winSize;

        isLoggedIn = true;

        var returnButton = helper.addButtonToLayer(this, "В меню", size.height*0.05);
        returnButton.setTitleTTFSizeForState(size.height*0.04, cc.CONTROL_STATE_NORMAL);
        returnButton.setPreferredSize(cc.size(size.width*0.25, size.height*0.08));
        helper.addMouseUpActionToControlButton(returnButton, function(target, event) { if (helper.isMouseEventOnItsTarget(event)) { helper.changeSceneTo(MenuScene); } });

        this.createBlankMineField();

        cc.audioEngine.setMusicVolume(0.25);
        cc.audioEngine.playMusic(res.game_music, true);

        return true;
    },
    addFlagTo: function(aTile) {
        data = aTile.getUserData();
        aTile.setUserData({ x: data.x, y: data.y, state: this.TILE_STATE_CLOSED_FLAG });
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_flag_png), cc.CONTROL_STATE_NORMAL);
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_flag_png), cc.CONTROL_STATE_DISABLED);
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_flag_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);
    },
    changeStateOf: function(aTile) {
        var texture, state, number,
            data = aTile.getUserData(),
            value = mines.askValueOf(data.x, data.y);
        switch(value) {
        case '*': {
            texture = res.mine_exploded_png;
            state = this.TILE_STATE_MINE_EXPLODED;
            break;
        }
        case   0: {
            texture = res.empty_png;
            state = this.TILE_STATE_EMPTY;
            this._opened_tiles++;
            break;
        }
        default : {
            texture = res['number_' + value + '_png'];
            state = this.TILE_STATE_NUMBER;
            this._opened_tiles++;
            break;
        }}
        aTile.setUserData({ x: data.x, y: data.y, state: state, value: value });
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(texture), cc.CONTROL_STATE_NORMAL);
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(texture), cc.CONTROL_STATE_DISABLED);
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(texture), cc.CONTROL_STATE_HIGHLIGHTED);

        if (state === this.TILE_STATE_EMPTY) {
            cc.audioEngine.playEffect(res.open_many_tiles);
            this.runActionOnSurroundingsOf(data.x, data.y);
        } else if (state === this.TILE_STATE_MINE_EXPLODED) {
            var data, tile, mines_coords = mines.getAllMines();
            for (var i = 0; i < mines_coords.length; i++) {
                tile = this._minefield_tiles[mines_coords[i].y][mines_coords[i].x];
                data = tile.getUserData();
                if (data.state === this.TILE_STATE_CLOSED_FLAG) {
                    tile.setUserData({ x: data.x, y: data.y, state: this.TILE_STATE_MINE_DEFUSED });
                    tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.mine_defused_png), cc.CONTROL_STATE_DISABLED);
                } else if (data.state === this.TILE_STATE_CLOSED) {
                    tile.setUserData({ x: data.x, y: data.y, state: this.TILE_STATE_MINE });
                    tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.mine_png), cc.CONTROL_STATE_DISABLED);
                }
            }
            var rows = this._minefield_tiles.length,
                columns = this._minefield_tiles[0].length;
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < columns; j++) {
                    tile = this._minefield_tiles[i][j];
                    data = tile.getUserData();
                    if (data.state === this.TILE_STATE_CLOSED_FLAG) {
                        tile.setUserData({ x: data.x, y: data.y, state: this.TILE_STATE_FLAG_WRONG });
                        tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_flag_wrong_png), cc.CONTROL_STATE_DISABLED);
                    } else if (data.state === this.TILE_STATE_CLOSED) {
                        tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_png), cc.CONTROL_STATE_DISABLED);
                    }
                    tile.setEnabled(false);
                }
            }
            cc.audioEngine.stopMusic();
            cc.audioEngine.playEffect(res.game_over_sound);
        }
        if (this._opened_tiles === this._tiles_total - this._mines_count) {
            var rows = this._minefield_tiles.length,
                columns = this._minefield_tiles[0].length;
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < columns; j++) {
                    tile = this._minefield_tiles[i][j];
                    data = tile.getUserData();
                    if (data.state === this.TILE_STATE_CLOSED) {
                        tile.setUserData({ x: data.x, y: data.y, state: this.TILE_STATE_CLOSED_FLAG });
                        tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_flag_png), cc.CONTROL_STATE_DISABLED);
                    }
                    tile.setEnabled(false);
                }
            }
            cc.audioEngine.stopMusic();
            cc.audioEngine.playEffect(res.victory_sound);
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
            rows = irows,
            columns = icolumns,
            size = cc.winSize,
            tile_size = Math.min(size.width*0.8/columns, size.height*0.8/rows),
            x_offset = (size.width  - tile_size*columns)/2,
            y_offset = (size.height + tile_size*rows)/2,
            selfPointer = this;
        this._minefield_tiles = [];
        this._tiles_total = rows*columns;
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

                helper.addMouseMoveActionToControlButton(tile, function(target, event) {
                    //cc.log('move');
                    var data = target.getUserData();
                    if (helper.isMouseEventOnItsTarget(event)) {
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
                    //cc.log('down');
                    if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                        var tile, data, rows = selfPointer._minefield_tiles.length,
                            columns = selfPointer._minefield_tiles[0].length;
                        for (var i = 0; i < rows; i++) {
                            for (var j = 0; j < columns; j++) {
                                tile = selfPointer._minefield_tiles[i][j];
                                data = tile.getUserData();
                                if (data.state === selfPointer.TILE_STATE_CLOSED) {
                                    tile.setUserData({ x: data.x, y: data.y, state: selfPointer.TILE_STATE_CLOSED_WITH_EMPTY_HIGHLIGHT });
                                    tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.empty_png), cc.CONTROL_STATE_HIGHLIGHTED);
                                }
                            }
                        }
                    }
                    if (helper.isMouseEventOnItsTarget(event)) {
                        var data = target.getUserData();
                        if (event.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                            if (data.state === selfPointer.TILE_STATE_CLOSED) {
                                selfPointer.addFlagTo(target);
                            } else if (data.state === selfPointer.TILE_STATE_CLOSED_FLAG) {
                                selfPointer.removeFlagFrom(target);
                            }
                        } else if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                            var data = target.getUserData();
                            if (data.state === selfPointer.TILE_STATE_CLOSED) {
                                target.setUserData({ x: data.x, y: data.y, state: selfPointer.TILE_STATE_CLOSED_WITH_EMPTY_HIGHLIGHT });
                                target.setBackgroundSpriteForState(helper.createS9TileFromRes(res.empty_png), cc.CONTROL_STATE_HIGHLIGHTED);
                            }
                        }
                    }
                });

                helper.addMouseUpActionToControlButton(tile, function(target, event) {
                    //cc.log('up');
                    if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                        var tile, data, rows = selfPointer._minefield_tiles.length,
                            columns = selfPointer._minefield_tiles[0].length;
                        for (var i = 0; i < rows; i++) {
                            for (var j = 0; j < columns; j++) {
                                tile = selfPointer._minefield_tiles[i][j];
                                data = tile.getUserData();
                                if (data.state === selfPointer.TILE_STATE_CLOSED_WITH_EMPTY_HIGHLIGHT) {
                                    tile.setUserData({ x: data.x, y: data.y, state: selfPointer.TILE_STATE_CLOSED });
                                    tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);
                                }
                            }
                        }
                    }
                    if (helper.isMouseEventOnItsTarget(event)) {
                        var data = target.getUserData();
                        if (event.getButton() === cc.EventMouse.BUTTON_LEFT) {
                            if (!selfPointer._game_started) {
                                selfPointer._game_started = true;
                                selfPointer.setMineFieldState(cc.p(data.x, data.y));
                            }
                            if (data.state === selfPointer.TILE_STATE_CLOSED) {
                                selfPointer.changeStateOf(target);
                            }
                        } else if (event.getButton() === cc.EventMouse.BUTTON_RIGHT && data.state === selfPointer.TILE_STATE_NUMBER) {
                            var mines_expected = data.value,
                                flags_count = 0,
                                closed_count = 0;
                            var x, y;
                            for (var i = 0; i < 8; i++) {
                                x = data.x + selfPointer._deltas[i][0];
                                y = data.y + selfPointer._deltas[i][1];
                                if (selfPointer._minefield_tiles[y] !== undefined && selfPointer._minefield_tiles[y][x] !== undefined) {
                                    if (selfPointer._minefield_tiles[y][x].getUserData().state === selfPointer.TILE_STATE_CLOSED_FLAG) {
                                        flags_count++;
                                    } else if (selfPointer._minefield_tiles[y][x].getUserData().state === selfPointer.TILE_STATE_CLOSED) {
                                        closed_count++;
                                    }
                                }
                            }
                            //cc.log('azaza ' + mines_expected + ' ' + flags_count);
                            if (mines_expected === flags_count) {
                                var x, y;
                                for (var i = 0; i < 8; i++) {
                                    x = data.x + selfPointer._deltas[i][0];
                                    y = data.y + selfPointer._deltas[i][1];
                                    if (selfPointer._minefield_tiles[y] !== undefined && selfPointer._minefield_tiles[y][x] !== undefined && selfPointer._minefield_tiles[y][x].getUserData().state === selfPointer.TILE_STATE_CLOSED) {
                                        selfPointer.changeStateOf(selfPointer._minefield_tiles[y][x]);
                                    }
                                }
                            } else if (mines_expected === flags_count + closed_count) {
                                var x, y;
                                for (var i = 0; i < 8; i++) {
                                    x = data.x + selfPointer._deltas[i][0];
                                    y = data.y + selfPointer._deltas[i][1];
                                    if (selfPointer._minefield_tiles[y] !== undefined && selfPointer._minefield_tiles[y][x] !== undefined && selfPointer._minefield_tiles[y][x].getUserData().state === selfPointer.TILE_STATE_CLOSED) {
                                        selfPointer.addFlagTo(selfPointer._minefield_tiles[y][x]);
                                    }
                                }
                            }
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
        aTile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_png), cc.CONTROL_STATE_DISABLED);
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
        var mines_count = imines;
        var tile, texture, rows = this._minefield_tiles.length,
            columns = this._minefield_tiles[0].length,
            size = cc.winSize,
            tile_size = Math.min(size.width*0.8/columns, size.height*0.8/rows),
            x_offset = (size.width  - tile_size*columns)/2,
            y_offset = (size.height - tile_size*rows)/2;
        mines.createMineField(columns, rows, mines_count, aPoint.x, aPoint.y);
        this._mines_count = mines_count;
        this._opened_tiles = 0;
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
