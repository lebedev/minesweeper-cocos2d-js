var GameLayer = cc.Layer.extend({
    TILE_STATE_CLOSED:                      0,
    TILE_STATE_CLOSED_FLAG:                 1,
    TILE_STATE_EMPTY:                       2,
    TILE_STATE_NUMBER:                      3,
    TILE_STATE_MINE_EXPLODED:               4,
    TILE_STATE_MINE:                        5,
    TILE_STATE_MINE_DEFUSED:                6,
    TILE_STATE_FLAG_WRONG:                  7,
    _deltas8: [
        [-1, -1],  [0, -1], [+1, -1],
        [-1,  0],/*[x,  y]*/[+1,  0],
        [-1, +1],  [0, +1], [+1, +1],
    ],
    _deltas9: [
        [-1, -1],  [0, -1], [+1, -1],
        [-1,  0],  [0,  0], [+1,  0],
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
    _last_tile_coords: null,
    _left_button_pressed: false,
    _right_button_pressed: false,
    _easy_state: false,
    _timer_label: null,
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

        timerSprite = new cc.Sprite();
        timerSprite.initWithFile(res.timer_png, cc.rect(0, 0, 137, 60));
        timerSprite.setAnchorPoint(cc.p(0.5, 0.5));
        timerSprite.setPosition(cc.p(size.width*0.25, size.height*0.05));
        this.addChild(timerSprite);

        this._timer_label = new cc.LabelTTF();
        this._timer_label.setAnchorPoint(cc.p(0.5, 0.5));
        this._timer_label.setPosition(cc.p(size.width*0.27, size.height*0.05));
        this._timer_label.fontName = "Impact";
        this._timer_label.fontSize = size.height*0.045;
        this._timer_label.string = 0;
        this.addChild(this._timer_label);

        minesLeftSprite = new cc.Sprite();
        minesLeftSprite.initWithFile(res.mines_left_png, cc.rect(0, 0, 137, 60));
        minesLeftSprite.setAnchorPoint(cc.p(0.5, 0.5));
        minesLeftSprite.setPosition(cc.p(size.width*0.75, size.height*0.05));
        this.addChild(minesLeftSprite);

        minesLeftLabel = new cc.LabelTTF();
        minesLeftLabel.setAnchorPoint(cc.p(0.5, 0.5));
        minesLeftLabel.setPosition(cc.p(size.width*0.77, size.height*0.05));
        minesLeftLabel.fontName = "Impact";
        minesLeftLabel.fontSize = size.height*0.045;
        minesLeftLabel.string = +sessionStorage.last_mines_value;
        this.addChild(minesLeftLabel);

        this.createBlankMineField();

        cc.audioEngine.playMusic(res.ingame_music, true);

        helper.addSoundAndMusicButtons(this);

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
        minesLeftLabel.string--;
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
                this.runActionOnSurroundingsOf(aPoint);
            }, 0.1);
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
            this._timer_label.unscheduleAllCallbacks()
            cc.audioEngine.stopMusic();
            cc.audioEngine.playEffect(res.game_over_sound);
        }
        if (this._opened_tiles === this._tiles_total - this._mines_count) {
            for (var i = 0; i < this._rows; i++) {
                for (var j = 0; j < this._columns; j++) {
                    if (this.getTile(cc.p(j, i)).state === this.TILE_STATE_CLOSED) {
                        this.addFlagTo(cc.p(j, i));
                    }
                }
            }
            cc.eventManager.removeListeners(this, false);
            this._timer_label.unscheduleAllCallbacks()
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
            rows = sessionStorage.last_rows_value,
            columns = sessionStorage.last_columns_value,
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
                row.push(tile);
            }
            this._minefield_tiles.push(row);
        }

        var game_layer = this;

        helper.addMouseActionsTo(
            this,
            function(aEvent) {
                if (aEvent.getButton() === cc.EventMouse.BUTTON_LEFT) {
                    cc.log('left pressed');
                    this._left_button_pressed = true;
                } else if (aEvent.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                    cc.log('right pressed');
                    this._right_button_pressed = true;
                }
                cc.log(this._buttons);
                if (this._left_button_pressed && this._right_button_pressed) {
                    this._easy_state = true;
                    cc.log('easy state on!');
                }

                var coords = this.getTileXYUnderMouse(aEvent),
                    tile = coords ? this._minefield_tiles[coords.y][coords.x] : null;
                if (tile && !this._easy_state && aEvent.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                    if (tile.state === this.TILE_STATE_CLOSED) {
                        this.addFlagTo(coords);
                    } else if (tile.state === this.TILE_STATE_CLOSED_FLAG) {
                        this.removeFlagFrom(coords);
                    }
                }
            }.bind(this),
            function(aEvent) {
                var tile, coords = this.getTileXYUnderMouse(aEvent);
                if (this._last_tile_coords) {
                    for (var i = 0; i < 9; i++) {
                        tile = this.getTile(cc.p(this._last_tile_coords.x + this._deltas9[i][0], this._last_tile_coords.y + this._deltas9[i][1]));
                        if (tile && tile.state === this.TILE_STATE_CLOSED) {
                            tile.initWithFile(res.closed_png, helper['rect_' + sprite_size]);
                        } else if (tile && tile.state === this.TILE_STATE_CLOSED_FLAG) {
                            tile.initWithFile(res.closed_flag_png, helper['rect_' + sprite_size]);
                        }
                    }
                }
                this._last_tile_coords = coords;
                if (this._last_tile_coords) {
                    if (!this._easy_state) {
                        if (this.getTile(this._last_tile_coords).state === this.TILE_STATE_CLOSED) {
                            if (aEvent.getButton() !== cc.EventMouse.BUTTON_LEFT) {
                                this.getTile(this._last_tile_coords).initWithFile(res.closed_highlighted_png, helper['rect_' + sprite_size]);
                            } else {
                                this.getTile(this._last_tile_coords).initWithFile(res.empty_png, helper['rect_' + sprite_size]);
                            }
                        } else if (this.getTile(this._last_tile_coords).state === this.TILE_STATE_CLOSED_FLAG) {
                            this.getTile(this._last_tile_coords).initWithFile(res.closed_flag_highlighted_png, helper['rect_' + sprite_size]);
                        }
                    } else {
                        cc.log('set new in easy mode');
                        for (var i = 0; i < 9; i++) {
                            tile = this.getTile(cc.p(this._last_tile_coords.x + this._deltas9[i][0], this._last_tile_coords.y + this._deltas9[i][1]));
                            if (tile && tile.state === this.TILE_STATE_CLOSED) {
                                tile.initWithFile(res.empty_png, helper['rect_' + sprite_size]);
                            }
                        }
                    }
                }
            }.bind(this),
            function(aEvent) {
                var coords = this.getTileXYUnderMouse(aEvent),
                    tile = this.getTile(coords);
                if (!this._easy_state && aEvent.getButton() === cc.EventMouse.BUTTON_LEFT) {
                    if (tile && tile.state === this.TILE_STATE_CLOSED) {
                        if (!this._game_started) {
                            this._game_started = true;
                            this.setMineFieldState(coords);
                        } else {
                            this.changeStateOf(coords);
                        }
                    }
                }
                if (aEvent.getButton() === cc.EventMouse.BUTTON_LEFT) {
                    cc.log('left released');
                    this._left_button_pressed = false;
                    if (this._easy_state) {
                        this._easy_state = false;
                        cc.log('easy state off on ' + coords.x + ':' + coords.y + ' on number: ' + (tile.state === this.TILE_STATE_NUMBER && tile.value));
                        if (tile.state === this.TILE_STATE_NUMBER) {
                            var mines_expected = tile.value,
                                flags_count = 0,
                                closed_count = 0;
                            for (var i = 0; i < 8; i++) {
                                tile = this.getTile(cc.p(coords.x + this._deltas8[i][0], coords.y + this._deltas8[i][1]));
                                if (tile && tile.state === this.TILE_STATE_CLOSED_FLAG) {
                                    flags_count++;
                                } else if (tile && tile.state === this.TILE_STATE_CLOSED) {
                                    closed_count++;
                                }
                            }
                            if (mines_expected === flags_count) {
                                var p, tile;
                                for (var i = 0; i < 8; i++) {
                                    p = cc.p(coords.x + this._deltas8[i][0], coords.y + this._deltas8[i][1]);
                                    tile = this.getTile(p);
                                    if (tile && tile.state ===  this.TILE_STATE_CLOSED) {
                                        this.changeStateOf(p);
                                    }
                                }
                            } else if (mines_expected === flags_count + closed_count) {
                                var p, tile;
                                for (var i = 0; i < 8; i++) {
                                    p = cc.p(coords.x + this._deltas8[i][0], coords.y + this._deltas8[i][1]);
                                    tile = this.getTile(p);
                                    if (tile && tile.state ===  this.TILE_STATE_CLOSED) {
                                        this.addFlagTo(p);
                                    }
                                }
                            } else {
                                cc.audioEngine.playEffect(res.easy_mode_fail_sound);
                                tile = this.getTile(coords);
                                tile.initWithFile(res['number_' + tile.value + 'x_png'], helper['rect_' + sprite_size]);

                                this.scheduleOnce(function(aCoords) {
                                    var tile = this.getTile(aCoords);
                                    tile.initWithFile(res['number_' + tile.value + '_png'], helper['rect_' + sprite_size]);
                                }.bind(this, coords), 0.25);

                                this.scheduleOnce(function(aCoords) {
                                    var tile = this.getTile(aCoords);
                                    tile.initWithFile(res['number_' + tile.value + 'x_png'], helper['rect_' + sprite_size]);
                                }.bind(this, coords), 0.5);

                                this.scheduleOnce(function(aCoords) {
                                    var tile = this.getTile(aCoords);
                                    tile.initWithFile(res['number_' + tile.value + '_png'], helper['rect_' + sprite_size]);
                                }.bind(this, coords), 0.75);
                            }
                        }
                    }
                } else if (aEvent.getButton() === cc.EventMouse.BUTTON_RIGHT) {
                    cc.log('right released');
                    this._right_button_pressed = false;
                }
                cc.log(this._buttons);
            }.bind(this)
        );
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
        minesLeftLabel.string++;
        var tile = this.getTile(aPoint);
        tile.state = this.TILE_STATE_CLOSED;
        tile.initWithFile(res.closed_png, helper['rect_' + sprite_size]);
    },
    runActionOnSurroundingsOf: function(aPoint) {
        var point, tile;
        for (var i = 0; i < 8; i++) {
            point = cc.p(
                aPoint.x + this._deltas8[i][0],
                aPoint.y + this._deltas8[i][1]
            );
            tile = this.getTile(point);
            if (tile && tile.state === this.TILE_STATE_CLOSED) {
                this.changeStateOf(point);
            }
        }
    },
    setMineFieldState: function(aPoint) {
        var mines_count = sessionStorage.last_mines_value;
        mines.createMineField(this._columns, this._rows, mines_count, aPoint.x, aPoint.y);
        this._mines_count = mines_count;
        this._opened_tiles = 0;
        mines.showMineField();
        this._timer_label.schedule(function() {
            this.string++;
        }, 1);
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
