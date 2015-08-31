var irows = 30, icolumns = 50, imines = 400, gamelayer;

var GameLayer = cc.Layer.extend({
    TILE_STATE_CLOSED:                      0,
    TILE_STATE_CLOSED_FLAG:                 1,
    TILE_STATE_EMPTY:                       2,
    TILE_STATE_NUMBER:                      3,
    TILE_STATE_MINE_EXPLODED:               4,
    TILE_STATE_MINE:                        5,
    TILE_STATE_MINE_DEFUSED:                6,
    TILE_STATE_FLAG_WRONG:                  7,
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
    _tile_size: null,
    _columns: null,
    _rows: null,
    _last_tile: null,
    ctor: function() {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        isLoggedIn = true;

        var returnButton = helper.addButtonToLayer(this, "В меню", size.height*0.05);
        returnButton.setTitleTTFSizeForState(size.height*0.04, cc.CONTROL_STATE_NORMAL);
        returnButton.setPreferredSize(cc.size(size.width*0.25, size.height*0.08));
        helper.addMouseUpActionTo(returnButton, function() { helper.changeSceneTo(MenuScene); })

        this.createBlankMineField();

        cc.audioEngine.setMusicVolume(0.25);
        cc.audioEngine.playMusic(res.ingame_music, true);

        this.scheduleOnce(function() {cc.log('azaza')}, 10);

        return true;
    },
    getTile: function(aPoint) {
        return aPoint
            && this._minefield_tiles[aPoint.y] !== undefined
            && this._minefield_tiles[aPoint.y][aPoint.x] !== undefined
            && this._minefield_tiles[aPoint.y][aPoint.x]
            || null;
    },
    addFlagTo: function(aPoint) {
        var tile = this.getTile(aPoint);
        tile.state = this.TILE_STATE_CLOSED_FLAG;
        tile.initWithFile(res.closed_flag_png, helper['rect_' + sprite_size]);
    },
    changeStateOf: function(aPoint) {
        var sprite, state,
            value = mines.askValueOf(aPoint.x, aPoint.y);
        switch(value) {
        case '*': {
            sprite = res.mine_exploded_png;
            state = this.TILE_STATE_MINE_EXPLODED;
            break;
        }
        case   0: {
            sprite = res.empty_png;
            state = this.TILE_STATE_EMPTY;
            this._opened_tiles++;
            break;
        }
        default : {
            sprite = res['number_' + value + '_png'];
            state = this.TILE_STATE_NUMBER;
            this._opened_tiles++;
            break;
        }};

        var tile = this.getTile(aPoint);
        tile.state = state;
        tile.value = value;
        tile.initWithFile(sprite, helper['rect_' + sprite_size]);

        if (state === this.TILE_STATE_EMPTY) {
            this.scheduleOnce(function() {
                cc.audioEngine.playEffect(res.open_many_tiles_sound);
                cc.audioEngine.setEffectsVolume(0.75);
                this.runActionOnSurroundingsOf(aPoint);
            }, 0.25);
        } else if (state === this.TILE_STATE_MINE_EXPLODED) {
            var tile, mines_coords = mines.getAllMines();
            for (var i = 0; i < mines_coords.length; i++) {
                tile = this.getTile(mines_coords[i]);
                if (tile.state === this.TILE_STATE_CLOSED_FLAG) {
                    tile.state = this.TILE_STATE_MINE_DEFUSED;
                    tile.initWithFile(res.mine_defused_png, helper['rect_' + sprite_size]);
                } else if (tile.state === this.TILE_STATE_CLOSED) {
                    tile.state = this.TILE_STATE_MINE;
                    tile.initWithFile(res.mine_png, helper['rect_' + sprite_size]);
                }
            }
            var rows = this._minefield_tiles.length,
                columns = this._minefield_tiles[0].length;
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < columns; j++) {
                    tile = this.getTile(cc.p(j, i));
                    if (tile.state === this.TILE_STATE_CLOSED_FLAG) {
                        tile.state = this.TILE_STATE_FLAG_WRONG;
                        tile.initWithFile(res.closed_flag_wrong_png, helper['rect_' + sprite_size]);
                    }
                }
            }
            cc.eventManager.removeListeners(this, false);
            cc.audioEngine.stopMusic();
            cc.audioEngine.playEffect(res.game_over_sound);
        }
        if (this._opened_tiles === this._tiles_total - this._mines_count) {
            for (var i = 0; i < this._rows; i++) {
                for (var j = 0; j < this._columns; j++) {
                    tile = this.getTile(cc.p(j, i));
                    if (tile.state === this.TILE_STATE_CLOSED) {
                        tile.state = this.TILE_STATE_CLOSED_FLAG;
                        tile.initWithFile(res.closed_flag_png, helper['rect_' + sprite_size]);
                    }
                }
            }
            cc.eventManager.removeListeners(this, false);
            cc.audioEngine.stopMusic();
            cc.audioEngine.stopAllEffects();
            cc.audioEngine.playEffect(res.victory_sound);
        }
    },
    createBlankMineField: function() {
        mines.clearMineField();
        if (this._minefield_tiles) {
            var old_rows = this._rows,
                old_columns = this._columns;
            for (var i = 0; i < old_rows; i++) {
                for (var j = 0; j < old_columns; j++) {
                    this._minefield_tiles[i][j].removeFromParent();
                    this._minefield_tiles[i][j] = null;
                }
                this._minefield_tiles[i] = null;
            }
            this._minefield_tiles = this._rows = this._columns = null;
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
        this._columns = columns;
        this._rows = rows;
        this._tile_size = tile_size;

        for (var i = 0; i < rows; i++) {
            row = [];
            for (var j = 0; j < columns; j++) {
                tile = helper.addTileToLayer(this);

                tile.setUserData({ x: j, y: i });
                tile.state = this.TILE_STATE_CLOSED;
                tile.setScale(tile_size/helper['rect_' + sprite_size].width, tile_size/helper['rect_' + sprite_size].width);
                tile.setPosition(cc.p(x_offset + (j + 0.5)*tile_size, y_offset - (i + 0.5)*tile_size));

                //tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_png), cc.CONTROL_STATE_NORMAL);
                //tile.setBackgroundSpriteForState(helper.createS9TileFromRes(res.closed_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);

                /*helper.addMouseDownActionToControlButton(tile, function(target, event) {
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
                });*/

                row.push(tile);
            }
            this._minefield_tiles.push(row);
        }

        var game_layer = this;

        helper.addMouseActionsTo(
            this,
            function(aEvent) {
                var coords = this.getTileXYUnderMouse(aEvent),
                    tile = coords ? this._minefield_tiles[coords.y][coords.x] : null;
                if (tile && aEvent.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                    if (tile.state === this.TILE_STATE_CLOSED) {
                        this.addFlagTo(coords);
                    } else if (tile.state === this.TILE_STATE_CLOSED_FLAG) {
                        this.removeFlagFrom(coords);
                    }
                }
            }.bind(this),
            function(aEvent) {
                var coords = this.getTileXYUnderMouse(aEvent),
                    tile = coords ? this._minefield_tiles[coords.y][coords.x] : null;
                if (this._last_tile) {
                    if (this._last_tile.state === this.TILE_STATE_CLOSED) {
                        this._last_tile.initWithFile(res.closed_png, helper['rect_' + sprite_size]);
                    } else if (this._last_tile.state === this.TILE_STATE_CLOSED_FLAG) {
                        this._last_tile.initWithFile(res.closed_flag_png, helper['rect_' + sprite_size]);
                    }
                }
                this._last_tile = tile;
                if (this._last_tile) {
                    if (this._last_tile.state === this.TILE_STATE_CLOSED) {
                        if (aEvent.getButton() !== cc.EventMouse.BUTTON_LEFT) {
                            this._last_tile.initWithFile(res.closed_highlighted_png, helper['rect_' + sprite_size]);
                        } else {
                            this._last_tile.initWithFile(res.empty_png, helper['rect_' + sprite_size]);
                        }
                    } else if (this._last_tile.state === this.TILE_STATE_CLOSED_FLAG) {
                        this._last_tile.initWithFile(res.closed_flag_highlighted_png, helper['rect_' + sprite_size]);
                    }
                }
            }.bind(this),
            function(aEvent) {
                if (aEvent.getButton() === cc.EventMouse.BUTTON_LEFT) {
                    var coords = this.getTileXYUnderMouse(aEvent);
                    tile = coords ? this._minefield_tiles[coords.y][coords.x] : null;
                    if (tile && tile.state === this.TILE_STATE_CLOSED) {
                        if (!this._game_started) {
                            this._game_started = true;
                            this.setMineFieldState(coords);
                        } else {
                            this.changeStateOf(coords);
                        }
                    }
                }
            }.bind(this)
        );
        /*var data = target.getUserData();
        if (helper.isMouseEventOnItsTarget(event)) {
            if (!target.isHighlighted()) {
                target.setHighlighted(true);
            }
        } else {
            if (target.isHighlighted()) {
                target.setHighlighted(false);
            }
        }*/
    },
    getTileXYUnderMouse: function(aEvent) {
        var size = cc.winSize,
            margin_x = (size.width  - this._tile_size*this._columns)/2,
            margin_y = (size.height - this._tile_size*this._rows)/2,
            loc = aEvent.getLocation();
            if (margin_x < loc.x && loc.x < size.width  - margin_x &&
                margin_y < loc.y && loc.y < size.height - margin_y) {
                var x = Math.floor((loc.x - margin_x)/(size.width - 2*margin_x)*this._columns),
                    y = this._rows - 1 - Math.floor((loc.y - margin_y)/(size.height - 2*margin_y)*this._rows);
                return cc.p(x, y);
            }
        return null;
    },
    removeFlagFrom: function(aPoint) {
        var tile = this.getTile(aPoint);
        tile.state = this.TILE_STATE_CLOSED;
        tile.initWithFile(res.closed_png, helper['rect_' + sprite_size]);
    },
    runActionOnSurroundingsOf: function(aPoint) {
        var point, tile;
        for (var i = 0; i < 8; i++) {
            point = cc.p(
                aPoint.x + this._deltas[i][0],
                aPoint.y + this._deltas[i][1]
            );
            tile = this.getTile(point);
            if (tile && tile.state === this.TILE_STATE_CLOSED) {
                this.changeStateOf(point);
            }
        }
    },
    setMineFieldState: function(aPoint) {
        var mines_count = imines;
        mines.createMineField(this._columns, this._rows, mines_count, aPoint.x, aPoint.y);
        this._mines_count = mines_count;
        this._opened_tiles = 0;
        mines.showMineField();
        this.changeStateOf(aPoint);
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        helper.ProcessTryCatcher(layer);
        this.addChild(layer);
    }
});
