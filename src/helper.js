var helper = {
    COLUMNS_MIN: 9,
    COLUMNS_MAX: 50,
    ROWS_MIN: 9,
    ROWS_MAX: 50,
    MINES_MIN: 1,

    CONTINUE_PREVIOUS_GAME: false,
    START_NEW_GAME: true,

    soundButton: null,
    musicButton: null,

    addButtonToLayer: function(aLayer, aString, aY, aDisabled) {
        var size = cc.winSize;

        var b = new cc.ControlButton();
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(res.button_normal_png), cc.CONTROL_STATE_NORMAL);
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(res.button_highlighted_png), cc.CONTROL_STATE_HIGHLIGHTED);
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(res.button_disabled_png), cc.CONTROL_STATE_DISABLED);
        b.setPreferredSize(cc.size(size.width*0.25, size.height*0.13));
        b.setAnchorPoint(cc.p(0.5, 0.5));
        b.setPosition(cc.p(size.width*0.5, aY));
        if (aString) {
            b.setTitleForState(aString, cc.CONTROL_STATE_NORMAL);
            b.setTitleTTFForState('Impact', cc.CONTROL_STATE_NORMAL);
            b.setTitleTTFSizeForState(size.height*0.07, cc.CONTROL_STATE_NORMAL);
            b.setTitleColorForState(cc.color(170,170,170), cc.CONTROL_STATE_DISABLED);
        }
        if (aDisabled) {
            b.setEnabled(false);
        }

        aLayer.addChild(b);

        return b;
    },

    addMouseActionsTo: function(aNode, aMouseDownCallback, aMouseMoveCallback, aMouseUpCallback) {
        var l = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseDown: aMouseDownCallback,
            onMouseMove: aMouseMoveCallback,
            onMouseUp: aMouseUpCallback
        });

        cc.eventManager.addListener(l, aNode);
    },

    addMouseUpActionTo: function(aNode, aCallback) {
        var l = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            downHere: false,
            onMouseDown: function(aEvent) {
                if (helper.isMouseEventOnItsTarget(aEvent)) {
                    this.downHere = true;
                }
            },
            onMouseUp: function(aEvent) {
                var target = aEvent.getCurrentTarget();
                if (this.downHere && target.enabled && helper.isMouseEventOnItsTarget(aEvent)) {
                    aCallback(aEvent, target);
                }
                this.downHere = false;
            }
        });
        cc.eventManager.addListener(l, aNode);
    },

    addSoundAndMusicButtons: function(aLayer) {
        var size = cc.winSize;
        helper.soundButton = helper.addButtonToLayer(aLayer, null, size.height*0.05);
        helper.setVolume(helper.soundButton, 'sound');
        helper.soundButton.setContentSize(cc.size(120, 120));
        helper.soundButton.setPreferredSize(cc.size(120, 120));
        helper.soundButton.setPosition(cc.p(size.width*0.94, size.height*0.9));
        helper.addMouseUpActionTo(helper.soundButton, function(aEvent) { var target = aEvent.getCurrentTarget(); helper.setVolume(target, 'sound', true); });

        helper.musicButton = helper.addButtonToLayer(aLayer, null, size.height*0.05);
        helper.setVolume(helper.musicButton, 'music');
        helper.musicButton.setContentSize(cc.size(120, 120));
        helper.musicButton.setPreferredSize(cc.size(120, 120));
        helper.musicButton.setPosition(cc.p(size.width*0.94, size.height*0.73));
        helper.addMouseUpActionTo(helper.musicButton, function(aEvent) { var target = aEvent.getCurrentTarget(); helper.setVolume(target, 'music', true); });
    },

    addTileToLayer: function(aLayer) {
        var size = cc.winSize;
        var b = new cc.Sprite();
        b.initWithFile(res.closed_png, helper.rect);
        b.setAnchorPoint(cc.p(0.5, 0.5));
        aLayer.addChild(b);

        return b;
    },

    addUITextToLayer: function(aLayer, aString, aFontSize, aY) {
        var t = helper.createUIText(aString, aFontSize);
        t.setPosition(cc.p(cc.winSize.width*0.5, aY));

        aLayer.addChild(t);

        return t;
    },

    changeSceneTo: function(aScene, aParam) {
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.stopMusic();
        var scene = aParam !== undefined ? new aScene(aParam) : new aScene();
        cc.director.runScene(new cc.TransitionFade(0.5, scene));
    },

    createS9TileFromRes: function(aRes) {
        return cc.Scale9Sprite.create(aRes, cc.rect(0, 0, 110, 110), cc.rect(25, 25, 65, 65));
    },

    createUIText: function(aString, aFontSize) {
        var t = new ccui.Text();
        t.attr({
            textAlign: cc.TEXT_ALIGNMENT_CENTER,
            string: aString,
            fontName: 'Impact',
            fontSize: aFontSize
        });
        t.enableOutline(cc.color(0, 0, 0), aFontSize*0.15);

        return t;
    },

    isMouseEventOnItsTarget: function(aEvent) {
        var target = aEvent.getCurrentTarget(),
            locationInNode = target.convertToNodeSpace(aEvent.getLocation()),
            s = target.getContentSize(),
            rect = cc.rect(0, 0, s.width, s.height);

        return cc.rectContainsPoint(rect, locationInNode);
    },

    sendToServer: function(aAction, aName, aValue) {
        var data = {
            action: aAction,
            login: sessionStorage.login,
            password: sessionStorage.password
        };
        if (aName) {
            data.name = aName;
        }
        if (aValue) {
            data.value = aValue;
        }
        return JSON.parse(server.sendAction(data));
    },

    setVolume: function(aTarget, aName, aSwitch) {
        if (aSwitch) {
            sessionStorage[aName + '_enabled'] = sessionStorage[aName + '_enabled'] === 'false' ? 'true' : 'false';
            if (sessionStorage.login && sessionStorage.password) {
                helper.sendToServer('update_value', aName + '_enabled', sessionStorage[aName + '_enabled']);
            }
        }
        var isDisabled = sessionStorage[aName + '_enabled'] === 'false';
        if (aName === 'sound') {
            cc.audioEngine.setEffectsVolume(isDisabled ? 0 : 0.5);
        } else {
            cc.audioEngine.setMusicVolume(isDisabled ? 0 : 0.25);
        }
        aTarget.setBackgroundSpriteForState(cc.Scale9Sprite.create(res[aName + '_' + (isDisabled ? 'disabled_' : '') + 'png'], cc.rect(0, 0, 120, 120), cc.rect(0, 0, 120, 120)), cc.CONTROL_STATE_NORMAL);
        aTarget.setBackgroundSpriteForState(cc.Scale9Sprite.create(res[aName + '_' + (isDisabled ? '' : 'disabled_') + 'png'], cc.rect(0, 0, 120, 120), cc.rect(0, 0, 120, 120)), cc.CONTROL_STATE_HIGHLIGHTED);
    },

    _ReplaceMethodWithTryCatched: function(aMethod) {
        return function() {
            try {
                return aMethod.apply(this, arguments);
            } catch (e) {
                cc.error(e);
            }
        };
    },

    AddTryCatchersToAllMethodsOf: function(aObject) {
        var method_name, method;
        for (method_name in aObject) {
            method = aObject[method_name];
            if (typeof method === "function") {
                aObject[method_name] = helper._ReplaceMethodWithTryCatched(method).bind(aObject);
            }
        }
    },

    rect: cc.rect(0, 0, 110, 110), // Rect of tile resources.
};

helper.AddTryCatchersToAllMethodsOf(helper);
