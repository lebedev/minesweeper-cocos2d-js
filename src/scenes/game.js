var GameLayer = cc.Layer.extend({
    TILE_STATE_CLOSED:                      0,
    TILE_STATE_CLOSED_FLAG:                 1,
    TILE_STATE_EMPTY:                       2,
    TILE_STATE_NUMBER:                      3,
    TILE_STATE_MINE_EXPLODED:               4,
    TILE_STATE_MINE:                        5,
    TILE_STATE_MINE_DEFUSED:                6,
    TILE_STATE_FLAG_WRONG:                  7,

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
    _both_buttons_pressed: false,

    _timer_label: null,
    _mines_left_label: null,

    _flags: null,
    _opened: null,
    ctor: function(aIsNewGame) {
        //////////////////////////////
        // 1. super init first
        this._super();

        // ask the window size
        var size = cc.winSize;

        this._opened = [];
        this._flags = [];

        if (!aIsNewGame) {
            aIsNewGame = (helper.sendActionToServer('continue_previous_game').status !== 'OK');
        }

        if (aIsNewGame) {
            localStorage.setItem('_rows', sessionStorage.last_rows_value);
            localStorage.setItem('_columns', sessionStorage.last_columns_value);
            localStorage.setItem('_mines', sessionStorage.last_mines_value);
            this._removeExpiredData();
        } else {
            sessionStorage.last_rows_value = localStorage.getItem('_rows');
            sessionStorage.last_columns_value = localStorage.getItem('_columns');
            sessionStorage.last_mines_value = localStorage.getItem('_mines');
        }

        var newGameButton = helper.addButtonToLayer(this, "Новая игра", size.height*0.95);
        newGameButton.setTitleTTFSizeForState(size.height*0.04, cc.CONTROL_STATE_NORMAL);
        newGameButton.setPreferredSize(cc.size(size.width*0.25, size.height*0.08));
        helper.addMouseUpActionTo(newGameButton, function() { this.parent.addChild(new GameLayer(helper.START_NEW_GAME)); this.removeFromParent(); }.bind(this));

        var timerSprite = new cc.Sprite();
        timerSprite.initWithFile(res.timer_png, cc.rect(0, 0, 137, 60));
        timerSprite.setAnchorPoint(cc.p(0.5, 0.5));
        timerSprite.setPosition(cc.p(size.width*0.25, size.height*0.05));
        this.addChild(timerSprite);

        this._timer_label = new cc.LabelTTF();
        this._timer_label.setAnchorPoint(cc.p(0.5, 0.5));
        this._timer_label.setPosition(cc.p(size.width*0.27, size.height*0.045));
        this._timer_label.fontName = "Impact";
        this._timer_label.fontSize = size.height*0.045;
        this._timer_label.string = 0;
        this.addChild(this._timer_label);

        var minesLeftSprite = new cc.Sprite();
        minesLeftSprite.initWithFile(res.mines_left_png, cc.rect(0, 0, 137, 60));
        minesLeftSprite.setAnchorPoint(cc.p(0.5, 0.5));
        minesLeftSprite.setPosition(cc.p(size.width*0.75, size.height*0.05));
        this.addChild(minesLeftSprite);

        this._mines_left_label = new cc.LabelTTF();
        this._mines_left_label.setAnchorPoint(cc.p(0.5, 0.5));
        this._mines_left_label.setPosition(cc.p(size.width*0.77, size.height*0.045));
        this._mines_left_label.fontName = "Impact";
        this._mines_left_label.fontSize = size.height*0.045;
        this._mines_left_label.string = +sessionStorage.last_mines_value;
        this.addChild(this._mines_left_label);

        var returnButton = helper.addButtonToLayer(this, "В меню", size.height*0.05);
        returnButton.setTitleTTFSizeForState(size.height*0.04, cc.CONTROL_STATE_NORMAL);
        returnButton.setPreferredSize(cc.size(size.width*0.25, size.height*0.08));
        helper.addMouseUpActionTo(returnButton, function() { helper.changeSceneTo(MenuScene); });

        this._createBlankMineField();

        cc.audioEngine.stopAllEffects();
        cc.audioEngine.playMusic(res.ingame_music, true);

        helper.setSoundsStateAndAddButtonsToLayer(this);

        if (!aIsNewGame) {
            var opened = JSON.parse(localStorage.getItem('_opened')) || [];
            for (var i = 0; i < opened.length; i++) {
                this._changeStateOf(opened[i].point, opened[i].value);
            }

            var flags = JSON.parse(localStorage.getItem('_flags')) || [];
            for (var i = 0; i < flags.length; i++) {
                this._addFlagTo(flags[i]);
            }
            this._game_started = true;

            this._startTimer(localStorage.getItem('timer'));
        }

        return true;
    },

    _removeExpiredData: function() {
        localStorage.removeItem('_mineField');
        localStorage.removeItem('_safe_tiles_left');

        helper.sendActionToServer('clear_mine_field');

        localStorage.removeItem('_flags');
        localStorage.removeItem('_opened');
        localStorage.removeItem('timer');
    },

    _createBlankMineField: function() {
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
            margin_x = (size.width  - tile_size*columns)/2,
            margin_y = (size.height + tile_size*rows)/2,
            selfPointer = this;
        this._minefield_tiles = [];
        this._tiles_total = rows*columns;
        this._columns = columns;
        this._mines_count = sessionStorage.last_mines_value;
        this._rows = rows;
        this._tile_size = tile_size;

        for (var i = 0; i < rows; i++) {
            row = [];
            for (var j = 0; j < columns; j++) {
                tile = helper.addTileToLayer(this);

                tile.state = this.TILE_STATE_CLOSED;
                tile.setScale(tile_size/helper.rect.width, tile_size/helper.rect.width);
                tile.setPosition(cc.p(margin_x + (j + 0.5)*tile_size, margin_y - (i + 0.5)*tile_size));
                row.push(tile);
            }
            this._minefield_tiles.push(row);
        }

        helper.addMouseActionsTo(
            this,
            this._mineFieldOnMouseDownCallback.bind(this),
            this._mineFieldOnMouseMoveCallback.bind(this),
            this._mineFieldOnMouseUpCallback.bind(this)
        );
    },

    _mineFieldOnMouseDownCallback: function(aEvent) {
        if (aEvent.getButton() === cc.EventMouse.BUTTON_LEFT) {
            this._left_button_pressed = true;
        } else if (aEvent.getButton() === cc.EventMouse.BUTTON_RIGHT) {
            this._right_button_pressed = true;
        }
        if (this._left_button_pressed && this._right_button_pressed) {
            this._both_buttons_pressed = true;
        }

        var coords = this._getTileXYUnderMouse(aEvent),
            tile = this._getTileAt(coords);
        if (tile && !this._both_buttons_pressed && aEvent.getButton() === cc.EventMouse.BUTTON_RIGHT) {
            if (tile.state === this.TILE_STATE_CLOSED) {
                this._addFlagTo(coords);
                tile.initWithFile(res.closed_flag_highlighted_png, helper.rect);
            } else if (tile.state === this.TILE_STATE_CLOSED_FLAG) {
                this._removeFlagFrom(coords);
                tile.initWithFile(res.closed_highlighted_png, helper.rect);
            }
        } else if (this._both_buttons_pressed) {
            this._set9TilesToEmpty();
        }
    },

    _mineFieldOnMouseMoveCallback: function(aEvent) {
        var tile, coords = this._getTileXYUnderMouse(aEvent);
        this._setLast9TilesToNormal();
        this._last_tile_coords = coords;
        if (this._last_tile_coords) {
            if (!this._both_buttons_pressed) {
                if (this._getTileAt(this._last_tile_coords).state === this.TILE_STATE_CLOSED) {
                    if (aEvent.getButton() !== cc.EventMouse.BUTTON_LEFT) {
                        this._getTileAt(this._last_tile_coords).initWithFile(res.closed_highlighted_png, helper.rect);
                    } else {
                        this._getTileAt(this._last_tile_coords).initWithFile(res.empty_png, helper.rect);
                    }
                } else if (this._getTileAt(this._last_tile_coords).state === this.TILE_STATE_CLOSED_FLAG) {
                    this._getTileAt(this._last_tile_coords).initWithFile(res.closed_flag_highlighted_png, helper.rect);
                }
            } else {
                this._set9TilesToEmpty();
            }
        }
    },

    _mineFieldOnMouseUpCallback: function(aEvent) {
        var coords = this._getTileXYUnderMouse(aEvent),
            tile = this._getTileAt(coords);
        if (!this._both_buttons_pressed && aEvent.getButton() === cc.EventMouse.BUTTON_LEFT) {
            if (tile && tile.state === this.TILE_STATE_CLOSED) {
                if (!this._game_started) {
                    this._game_started = true;
                    this._setMineFieldStateWithStartPoint(coords);
                } else {
                    this._changeStateOf(coords);
                }
            }
        }
        if (aEvent.getButton() === cc.EventMouse.BUTTON_LEFT) {
            this._left_button_pressed = false;
            if (this._both_buttons_pressed) {
                this._both_buttons_pressed = false;
                this._setLast9TilesToNormal();
                this._callBothButtonsSpecialActionAt(coords);
            }
        } else if (aEvent.getButton() === cc.EventMouse.BUTTON_RIGHT) {
            this._right_button_pressed = false;
        }
    },

    _setMineFieldStateWithStartPoint: function(aPoint) {
        server.processAction({
            action: 'create_mine_field',
            login: sessionStorage.login,
            password: sessionStorage.password,
            columns: this._columns,
            rows: this._rows,
            rows: this._rows,
            maxMines: this._mines_count,
            x: aPoint.x,
            y: aPoint.y
        });

        this._opened_tiles = 0;

        this._startTimer();
        this._changeStateOf(aPoint);
    },

    _getTileXYUnderMouse: function(aEvent) {
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

    _getTileAt: function(aPoint) {
        return aPoint
            && this._minefield_tiles[aPoint.y] !== undefined
            && this._minefield_tiles[aPoint.y][aPoint.x] !== undefined
            && this._minefield_tiles[aPoint.y][aPoint.x]
            || null;
    },

    _changeStateOf: function(aPoint, aValueFromPreviousGame) {
        var sprite, state,
            responseRaw, response, value;
            if (aValueFromPreviousGame !== undefined) {
                value = aValueFromPreviousGame;
            } else {
                responseRaw = server.processAction({
                    action: 'ask_value_of_tile',
                    login: sessionStorage.login,
                    password: sessionStorage.password,
                    x: aPoint.x,
                    y: aPoint.y
                });
                response = JSON.parse(responseRaw);
                value = response.status === 'OK' && response.value;
            }

            this._opened.push({point:aPoint, value:value});
            localStorage.setItem('_opened', JSON.stringify(this._opened));

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

        var tile = this._getTileAt(aPoint);
        tile.state = state;
        tile.value = value;
        tile.initWithFile(sprite, helper.rect);

        if (aValueFromPreviousGame !== undefined) {
            return;
        }

        if (state === this.TILE_STATE_EMPTY) {
            this.scheduleOnce(function() {
                cc.audioEngine.playEffect(res.open_many_tiles_sound);
                this._changeStateOfSurroundingsOf(aPoint);
            }, 0.1);
        } else if (aValueFromPreviousGame === undefined && state === this.TILE_STATE_MINE_EXPLODED) {
            this._runFailActions();
        }
        if (aValueFromPreviousGame === undefined && this._opened_tiles === this._tiles_total - this._mines_count) {
            this._runWinActions();
        }
    },

    _changeStateOfSurroundingsOf: function(aPoint) {
        var point, tile;
        for (var i = 0; i < 8; i++) {
            point = cc.p(
                aPoint.x + helper.deltas8[i][0],
                aPoint.y + helper.deltas8[i][1]
            );
            tile = this._getTileAt(point);
            if (tile && tile.state === this.TILE_STATE_CLOSED) {
                this._changeStateOf(point);
            }
        }
    },

    _addFlagTo: function(aPoint) {
        this._mines_left_label.string--;
        var tile = this._getTileAt(aPoint);
        tile.state = this.TILE_STATE_CLOSED_FLAG;
        tile.initWithFile(res.closed_flag_png, helper.rect);

        this._flags.push(aPoint);
        localStorage.setItem('_flags', JSON.stringify(this._flags));
    },

    _removeFlagFrom: function(aPoint) {
        this._mines_left_label.string++;
        var tile = this._getTileAt(aPoint);
        tile.state = this.TILE_STATE_CLOSED;
        tile.initWithFile(res.closed_png, helper.rect);

        var index = 0;
        while (this._flags[index].x !== aPoint.x && this._flags[index].y !== aPoint.y) {
            index++;
        }

        var tmp = this._flags;
        this._flags = tmp.slice(0, index).concat(tmp.slice(index + 1));
        localStorage.setItem('_flags', JSON.stringify(this._flags));
    },

    _startTimer: function(aFrom) {
        if (aFrom) {
            this._timer_label.string = aFrom;
        }
        this._timer_label.schedule(function() {
            this.string++;
            localStorage.setItem('timer', this.string);
        }, 1);
    },

    _set9TilesToEmpty: function() {
        for (var i = 0; i < 9; i++) {
            var tile = this._getTileAt(cc.p(this._last_tile_coords.x + helper.deltas9[i][0], this._last_tile_coords.y + helper.deltas9[i][1]));
            if (tile && tile.state === this.TILE_STATE_CLOSED) {
                tile.initWithFile(res.empty_png, helper.rect);
            }
        }
    },

    _setLast9TilesToNormal: function() {
        if (this._last_tile_coords) {
            for (var i = 0; i < 9; i++) {
                tile = this._getTileAt(cc.p(this._last_tile_coords.x + helper.deltas9[i][0], this._last_tile_coords.y + helper.deltas9[i][1]));
                if (tile && tile.state === this.TILE_STATE_CLOSED) {
                    tile.initWithFile(res.closed_png, helper.rect);
                } else if (tile && tile.state === this.TILE_STATE_CLOSED_FLAG) {
                    tile.initWithFile(res.closed_flag_png, helper.rect);
                }
            }
        }
    },

    _callBothButtonsSpecialActionAt: function(aCoords) {
        var tile = this._getTileAt(aCoords);
        if (tile.state === this.TILE_STATE_NUMBER) {
            var mines_expected = tile.value,
                closed_count = 0,
                flags_count = 0,
                states = [],
                ps = [],
                tile_delta,
                p;
            for (var i = 0; i < 8; i++) {
                p = cc.p(aCoords.x + helper.deltas8[i][0], aCoords.y + helper.deltas8[i][1]);
                ps.push(p);
                tile_delta = this._getTileAt(p);
                states.push(tile_delta && tile_delta.state);
                switch(states[i]) {
                case this.TILE_STATE_CLOSED_FLAG: flags_count++;  break;
                case this.TILE_STATE_CLOSED     : closed_count++; break;
                }
            }
            if (mines_expected === flags_count) {
                for (var i = 0; i < 8; i++) {
                    if (states[i] === this.TILE_STATE_CLOSED) {
                        this._changeStateOf(ps[i]);
                    }
                }
            } else if (mines_expected === flags_count + closed_count) {
                for (var i = 0; i < 8; i++) {
                    if (states[i] === this.TILE_STATE_CLOSED) {
                        this._addFlagTo(ps[i]);
                    }
                }
            } else {
                cc.audioEngine.playEffect(res.both_buttons_pressed_mode_fail_sound);

                for (var i = 0; i < 4; i++) {
                    this.scheduleOnce(function(aTile, aI) {
                        aTile.initWithFile(res['number_' + aTile.value + (aI%2 ? '' : 'x') + '_png'], helper.rect);
                    }.bind(this, tile, i), i*0.25);
                }
            }
        }
    },

    _updateStatistics: function(aMinesDefused, aWin) {
        sessionStorage.games             = helper.sendActionWithDataToServer('increase_value', 'games', 1).value;
        sessionStorage.total_time_played = helper.sendActionWithDataToServer('increase_value', 'total_time_played', +this._timer_label.string).value;
        if (aMinesDefused) {
            sessionStorage.mines_defused = helper.sendActionWithDataToServer('increase_value', 'mines_defused', +aMinesDefused).value;
        }
        if (aWin) {
            sessionStorage.wins          = helper.sendActionWithDataToServer('increase_value', 'wins', 1).value;
        }
    },

    _runWinActions: function() {
        for (var i = 0; i < this._rows; i++) {
            for (var j = 0; j < this._columns; j++) {
                if (this._getTileAt(cc.p(j, i)).state === this.TILE_STATE_CLOSED) {
                    this._addFlagTo(cc.p(j, i));
                }
            }
        }
        cc.eventManager.removeListeners(this, false);
        this._timer_label.unscheduleAllCallbacks()
        cc.audioEngine.stopMusic();
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.playEffect(res.victory_sound);

        this._updateStatistics(this._mines_count, true);

        this._removeExpiredData();
    },

    _runFailActions: function() {
        var tile, defused = 0,
            mines_coords = helper.sendActionToServer('get_all_mines').value;
        for (var i = 0; i < mines_coords.length; i++) {
            tile = this._getTileAt(mines_coords[i]);
            if (tile.state === this.TILE_STATE_CLOSED_FLAG) {
                defused++;
                tile.state = this.TILE_STATE_MINE_DEFUSED;
                tile.initWithFile(res.mine_defused_png, helper.rect);
            } else if (tile.state === this.TILE_STATE_CLOSED) {
                tile.state = this.TILE_STATE_MINE;
                tile.initWithFile(res.mine_png, helper.rect);
            }
        }
        var rows = this._minefield_tiles.length,
            columns = this._minefield_tiles[0].length;
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                tile = this._getTileAt(cc.p(j, i));
                if (tile.state === this.TILE_STATE_CLOSED_FLAG) {
                    tile.state = this.TILE_STATE_FLAG_WRONG;
                    tile.initWithFile(res.closed_flag_wrong_png, helper.rect);
                }
            }
        }
        cc.eventManager.removeListeners(this, false);
        this._timer_label.unscheduleAllCallbacks()
        cc.audioEngine.stopMusic();
        cc.audioEngine.playEffect(res.game_over_sound);

        this._updateStatistics(defused);

        this._removeExpiredData();
    }
});

var GameScene = cc.Scene.extend({
    _is_new_game: null,
    ctor: function(isNewGame) {
        this._super();
        this._is_new_game = isNewGame;
    },
    onEnter: function() {
        this._super();
        var layer = new GameLayer(this._is_new_game);
        helper.AddTryCatchersToAllMethodsOf(layer);
        this.addChild(layer);
    }
});
