var helper = {
    addActionsToControlButton: function(aNode, aMouseDownCallback, aMouseMoveCallback, aMouseUpCallback) {
        var l = cc.EventListener.create({
            event: cc.EventListener.MOUSE,
            previousNode: null,
            rows: aNode._minefield_tiles.length,
            columns: aNode._minefield_tiles[0].length,
            minx: aNode._minefield_tiles[0][0].getPositionX() - aNode.tile_size/2,
            maxx: aNode._minefield_tiles[0][aNode._minefield_tiles[0].length-1].getPositionX() + aNode.tile_size/2,
            miny: aNode._minefield_tiles[aNode._minefield_tiles.length-1][0].getPositionY() - aNode.tile_size/2,
            maxy: aNode._minefield_tiles[0][0].getPositionY() + aNode.tile_size/2,
            lastMove: Date.now(),

            testNode: function(aNode, aLocation) {
                var locationInNode = aNode.convertToNodeSpace(aLocation),
                    s = aNode.getContentSize(),
                    rect = cc.rect(0, 0, s.width, s.height);
                return cc.rectContainsPoint(rect, locationInNode);
            },
            onMouseDown: function(event) {
                var target = event.getCurrentTarget();
                if (target.enabled) {
                    if (helper.isMouseEventOnItsTarget(event)) {
                        this.mouseIsDown = true;
                    }
                    if (aMouseDownCallback) {
                        aMouseDownCallback(target, event);
                    }
                }
            },
            onMouseMove: function(event) {
                event.stopPropagation();
                /*var now = Date.now();
                if (now - this.lastMove < 100) {
                    this.lastMove = now;
                    return;
                }*/
                //event.preventDefault();
                if (aMouseMoveCallback) {
                    aMouseMoveCallback.call(this, event);
                }
                //console.time('move');
                //cc.log(this.allNodesLength);

                /*this.allNodes.every(function(aNode){

                    if (cc.rectContainsPoint(rect, locationInNode)) {
                        if (!aNode.isHighlighted()) {
                            aNode.setHighlighted(true);
                        }
                    } else {
                        if (aNode.isHighlighted()) {
                            aNode.setHighlighted(false);
                        }
                    }*/
                    //return true;
                //});
                //console.timeEnd('move');
                //count++;
                //cc.log('mean: ' + summ/count + 'ms.');
            },
            onMouseUp: function(event) {
                var target = event.getCurrentTarget();
                if (target.enabled && aMouseUpCallback) {
                    if (helper.isMouseEventOnItsTarget(event)) {
                        target.setHighlighted(true);
                    }
                    if (this.mouseIsDown) {
                        aMouseUpCallback(target, event);
                        this.mouseIsDown = false;
                    }
                }
            }
        });

        cc.eventManager.addListener(l, aNode);
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

    addTileToLayer: function(aLayer) {
        var size = cc.winSize;
        var b = new cc.Sprite();
        b.initWithFile(res.closed_png, helper.rect1);
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

    changeSceneTo: function(aScene) {
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.stopMusic();
        var scene = new aScene();
        cc.director.runScene(new cc.TransitionFade(0.5, scene));
    },

    createControlButton: function(aString, aIsButton, aY, aDisabled) {
        var size = cc.winSize;

        var textures = {
            normal:      aIsButton ? res.button_normal_png      : res.closed_png,
            highlighted: aIsButton ? res.button_highlighted_png : res.closed_highlighted_png,
            disabled:    aIsButton ? res.button_disabled_png    : res.closed_png
        };

        var b = new cc.ControlButton();
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(textures.normal, aIsButton), cc.CONTROL_STATE_NORMAL);
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(textures.highlighted, aIsButton), cc.CONTROL_STATE_HIGHLIGHTED);
        b.setBackgroundSpriteForState(helper.createS9TileFromRes(textures.disabled, aIsButton), cc.CONTROL_STATE_DISABLED);
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

        return b;
    },

    createS9TileFromRes: function(aRes, aIsButton) {
        if (aIsButton) {
            return cc.Scale9Sprite.create(aRes, cc.rect(0, 0, 110, 110), cc.rect(25, 25, 65, 65));
        } else {
            return cc.Scale9Sprite.create(aRes, helper.rect1, helper.rect2);
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
    rect1: cc.rect(0, 0, 45, 45),
    rect2: cc.rect(1, 1, 43, 43),
};

helper.ProcessTryCatcher(helper);
