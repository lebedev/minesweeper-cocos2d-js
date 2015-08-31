var helper = {
    addActionsToControlButton: function(aButton, aMouseDownCallback, aMouseMoveCallback, aMouseUpCallback) {
        var l = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            onMouseDown: null || aMouseDownCallback && function(event) {
                var target = event.getCurrentTarget();
                if (helper.isMouseEventOnItsTarget(event)) {
                    aMouseDownCallback(target, event);
                }
            },
            onMouseMove: null || aMouseMoveCallback && function(event) {
                var target = event.getCurrentTarget();
                aMouseMoveCallback(target, helper.isMouseEventOnItsTarget(event));

                /*if (helper.isTouchOnTarget(touch, target)) {
                    if (target.isHighlighted() === false) {
                        target.setHighlighted(true);
                    }
                } else {
                    if (target.isHighlighted() === true) {
                        target.setHighlighted(false);
                    }
                }*/
            },
            onMouseUp: function(event) {
                var target = event.getCurrentTarget();
                if (helper.isMouseEventOnItsTarget(event)) {
                    target.setHighlighted(true);
                    if (aMouseUpCallback) {
                        aMouseUpCallback(target, event);
                    }
                }
            }
        });

        cc.eventManager.addListener(l, aButton);
    },

    addButtonToLayer: function(aLayer, aString, aY, aDisabled) {
        var b = helper.createControlButton(aString, true, aY, aDisabled);
        aLayer.addChild(b);

        return b;
    },

    addMouseDownActionToControlButton: function(aButton, aCallback) {
        helper.addActionsToControlButton(aButton, aCallback, null, null);
    },

    addMouseMoveActionToControlButton: function(aButton, aCallback) {
        helper.addActionsToControlButton(aButton, null, aCallback, null);
    },

    addMouseUpActionToControlButton: function(aButton, aCallback) {
        helper.addActionsToControlButton(aButton, null, null, aCallback);
    },

    addTileToLayer: function(aLayer, aY) {
        var b = helper.createControlButton('', true, aY);
        aLayer.addChild(b);

        return b;
    },

    addUITextToLayer: function(aLayer, aString, aFontSize, aY) {
        var t = helper.createUIText(aString, aFontSize);
        t.attr({
            x: cc.winSize.width*0.5,
            y: aY
        });

        aLayer.addChild(t);

        return t;
    },

    changeSceneTo: function(aScene) {
        var scene = new aScene();
        cc.director.runScene(new cc.TransitionFade(0.5, scene));
    },

    createControlButton: function(aString, aIsButton, aY, aDisabled) {
        var size = cc.winSize;

        var textures = {
            normal:      aIsButton ? res.button_normal_png      : res.closed_highlighted_png,
            highlighted: aIsButton ? res.button_highlighted_png : res.empty_highlighted_png,
            disabled:    aIsButton ? res.button_disabled_png    : res.closed_png
        };

        var b = new cc.ControlButton();
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(textures.normal, aIsButton), cc.CONTROL_STATE_NORMAL);
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(textures.highlighted, aIsButton), cc.CONTROL_STATE_HIGHLIGHTED);
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(textures.disabled, aIsButton), cc.CONTROL_STATE_DISABLED);
        b.setPreferredSize(cc.size(size.width*0.25, size.height*0.13));
        b.setAnchorPoint(cc.p(0.5, 0.5));
        b.setPosition(cc.p(size.width*0.5, aY));
        b.setTitleForState(aString, cc.CONTROL_STATE_NORMAL);
        b.setTitleTTFForState('Impact', cc.CONTROL_STATE_NORMAL);
        b.setTitleTTFSizeForState(size.height*0.07, cc.CONTROL_STATE_NORMAL);
        b.setTitleColorForState(cc.color(170,170,170), cc.CONTROL_STATE_DISABLED);
        if (aDisabled) {
            b.setEnabled(false);
        }

        return b;
    },

    createS9TileFromRes: function(aRes, aIsButton) {
        if (aIsButton) {
            return cc.Scale9Sprite.create(aRes, cc.rect(0, 0, 110, 110), cc.rect(25, 25, 65, 65));
        } else {
            return cc.Scale9Sprite.create(aRes, cc.rect(5, 5, 100, 100), cc.rect(5, 5, 90, 90));
        }
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

    isMouseEventOnItsTarget: function(event) {
        var target = event.getCurrentTarget(),
            locationInNode = target.convertToNodeSpace(event.getLocation()),
            s = target.getContentSize(),
            rect = cc.rect(0, 0, s.width, s.height);

        return cc.rectContainsPoint(rect, locationInNode);
    },

    ReplaceWithTryCatch: function(method) {
        return function() {
            try {
                return method.apply(null, arguments);
            } catch (e) {
                cc.error(e);
            }
        };
    },

    ProcessTryCatcher: function(object) {
        var method_name, method;
        for (method_name in object) {
            method = object[method_name];
            if (typeof method === "function") {
                object[method_name] = helper.ReplaceWithTryCatch(method);
            }
        }
    },
};

helper.ProcessTryCatcher(helper);
