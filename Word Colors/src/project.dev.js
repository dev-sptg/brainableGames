require = function() {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }
        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function(r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }
      return n[i].exports;
    }
    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
    return o;
  }
  return r;
}()({
  AnalyticsController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9a581on6m1OlJqhj3Hgxba5", "AnalyticsController");
    "use strict";
    var AnalyticsController = cc.Class({
      extends: cc.Component,
      properties: {},
      statics: {
        instance: null
      },
      onLoad: function onLoad() {
        AnalyticsController.instance = this;
        cc.game.addPersistRootNode(this.node);
        this._disabled = false;
        Object.defineProperties(this, {
          disabled: {
            set: function set(val) {
              this._disabled = val;
            },
            get: function get() {
              return this._disabled;
            }
          }
        });
        window.onerror = this._onError.bind(this);
      },
      _onError: function _onError(msg, url, lineNo, colNo, error) {
        if (this._disabled) return;
        if (error) if (error.stack) {
          if (this._lastError === error.stack) return;
          console.log(error.stack);
          ga.GameAnalytics.addErrorEvent(ga.EGAErrorSeverity.Error, error.stack);
          amplitude.getInstance().logEvent("ERROR", {
            message: error.stack,
            file: error.fileName,
            lineNo: error.lineNumber
          });
          this._lastError = error.stack;
        } else {
          if (amplitude.lastError === error.message) return;
          console.log(error.message);
          ga.GameAnalytics.addErrorEvent(ga.EGAErrorSeverity.Error, error.message);
          amplitude.getInstance().logEvent("ERROR", {
            message: error.message,
            file: error.fileName,
            lineNo: error.lineNumber
          });
          this._lastError = error.message;
        } else {
          if (this._lastError === msg) return;
          console.log(msg);
          ga.GameAnalytics.addErrorEvent(ga.EGAErrorSeverity.Error, msg + "\n" + url + "\n" + lineNo);
          amplitude.getInstance().logEvent("ERROR", {
            message: msg,
            file: url,
            lineNo: lineNo
          });
          this._lastError = msg;
        }
        return false;
      },
      setUserProperties: function setUserProperties() {
        if (this._disabled) return;
        cc.sys.isMobile || amplitude.getInstance().setUserProperties({
          profileId: require("SaveManager").instance.userId
        });
      },
      logCustomEvent: function logCustomEvent(name, attributes) {
        if (this._disabled) return;
        if (cc.sys.os === cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "logCustomEvent", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", name, attribute1, attribute2, attribute3); else {
          amplitude.getInstance().logEvent(name, attributes);
          FB.AppEvents.logEvent(name, null, attributes);
        }
      },
      logErrorEvent: function logErrorEvent(error) {
        if (this._disabled) return;
        amplitude.getInstance().logEvent("ERROR", {
          message: error
        });
        ga.GameAnalytics.addErrorEvent(ga.EGAErrorSeverity.Error, error);
      },
      logPurchase: function logPurchase(price, name, category, productId) {
        if (this._disabled) return;
        if (cc.sys.os === cc.sys.OS_ANDROID) jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "logPurchase", "(FLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", price, name, category, productId); else {
          var revenue = new amplitude.Revenue().setProductId(productId).setPrice(price).setQuantity(1);
          amplitude.getInstance().logRevenueV2(revenue);
          ga.GameAnalytics.addBusinessEvent("USD", parseInt(100 * price), category, productId);
        }
      }
    });
    cc._RF.pop();
  }, {
    SaveManager: "SaveManager"
  } ],
  AudioManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f7322bN101KEaI1sLv35w5E", "AudioManager");
    "use strict";
    var FADE_TIME = 1;
    var AudioManager = cc.Class({
      extends: cc.Component,
      properties: {},
      statics: {
        instance: null
      },
      onLoad: function onLoad() {
        AudioManager.instance = this;
        cc.game.addPersistRootNode(this.node);
        this._time = 0;
        this._fades = [];
        this._musicAudioIds = [];
        var userData = null;
        cc.sys.localStorage.getItem("audioData") && (userData = JSON.parse(cc.sys.localStorage.getItem("audioData")));
        this._music = !userData || userData.music;
        this._sound = !userData || userData.sound;
        this._musicVolume = this._music ? 1 : 0;
        this._soundVolume = this._sound ? 1 : 0;
        Object.defineProperties(this, {
          music: {
            get: function get() {
              return this._music;
            },
            set: function set(val) {
              this._music = val;
              this._saveAudioData();
              this._musicVolume = this._music ? 1 : 0;
              for (var i = 0; i < this._musicAudioIds.length; i++) cc.audioEngine.setVolume(this._musicAudioIds[i], this._musicVolume);
            }
          },
          sound: {
            get: function get() {
              return this._sound;
            },
            set: function set(val) {
              this._sound = val;
              this._saveAudioData();
              this._soundVolume = this._sound ? 1 : 0;
            }
          },
          musicPlaying: {
            get: function get() {
              return this._musicAudioIds.length > 0;
            }
          }
        });
      },
      init: function init() {},
      stopAllMusic: function stopAllMusic() {
        for (var i = 0; i < this._musicAudioIds.length; i++) cc.audioEngine.stop(this._musicAudioIds[i]);
        this._musicAudioIds = [];
        this._queuePlaying && (this._queuePlaying = false);
      },
      playMusic: function playMusic(clip, loop) {
        var id = cc.audioEngine.play(clip, loop, this._musicVolume);
        this._musicAudioIds.push(id);
        return id;
      },
      playMusicQueue: function playMusicQueue(clips, loop) {
        var random = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        if (!clips || 0 === clips.length || this._queuePlaying) return;
        this._queuePlaying = true;
        this._loopQueue = loop;
        this._randomQueue = random;
        this._queueClips = clips;
        this._randomQueue ? this._queueIndex = Math.floor(Math.random() * this._queueClips.length) : this._queueIndex = 0;
        this._queueId = cc.audioEngine.play(this._queueClips[this._queueIndex], false, this._musicVolume);
        cc.audioEngine.setFinishCallback(this._queueId, this._queueFinish.bind(this));
        this._musicAudioIds.push(this._queueId);
        cc.log("start queue");
      },
      _queueFinish: function _queueFinish() {
        this._musicAudioIds.splice(this._musicAudioIds.indexOf(this._queueId), 1);
        if (this._randomQueue) {
          this._queueIndex = Math.floor(Math.random() * this._queueClips.length);
          cc.log("random queue index: " + this._queueIndex);
        }
        this._queueIndex++;
        cc.log("queue index ++");
        if (this._queueIndex >= this._queueClips.length) {
          if (!this._loopQueue) {
            this._queuePlaying = false;
            this._queueClips = null;
            this._queueId = null;
            cc.log("queue ended");
            return;
          }
          this._queueIndex = 0;
          cc.log("queue loop");
        }
        this._queueId = cc.audioEngine.play(this._queueClips[this._queueIndex], false, this._musicVolume);
        cc.audioEngine.setFinishCallback(this._queueId, this._queueFinish.bind(this));
        this._musicAudioIds.push(this._queueId);
      },
      setMusicLoop: function setMusicLoop(id, loop) {
        cc.audioEngine.setLoop(id, loop);
      },
      pauseMusic: function pauseMusic(id) {
        cc.audioEngine.pause(id);
      },
      resumeMusic: function resumeMusic(id) {
        cc.audioEngine.resume(id);
      },
      stopMusic: function stopMusic(id) {
        cc.audioEngine.stop(id);
        var index = this._musicAudioIds.indexOf(id);
        index > -1 && this._musicAudioIds.splice(index, 1);
      },
      playSound: function playSound(clip) {
        var delay = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
        delay > 0 ? this.scheduleOnce(function() {
          this.playSound(clip);
        }, delay) : cc.audioEngine.play(clip, false, this._soundVolume);
      },
      fadeAllMusic: function fadeAllMusic(volume) {
        for (var i = 0; i < this._musicAudioIds.length; i++) this.fadeMusic(this._musicAudioIds[i], volume);
      },
      fadeMusic: function fadeMusic(id, volume) {
        if (!this._music) return;
        for (var i = 0; i < this._musicAudioIds.length; i++) if (id === this._musicAudioIds[i]) {
          this._fades.push({
            id: id,
            startVol: cc.audioEngine.getVolume(id),
            targetVol: volume,
            time: this._time
          });
          return;
        }
      },
      _saveAudioData: function _saveAudioData() {
        var data = {
          music: this._music,
          sound: this._sound
        };
        cc.sys.localStorage.setItem("audioData", JSON.stringify(data));
      },
      update: function update(dt) {
        this._time += dt;
        for (var i = this._fades.length - 1; i > -1; i--) {
          var elapsed = this._time - this._fades[i].time;
          var pcent = elapsed / FADE_TIME;
          pcent > 1 && (pcent = 1);
          var vol = (this._fades[i].targetVol - this._fades[i].startVol) * pcent + this._fades[i].startVol;
          cc.audioEngine.setVolume(this._fades[i].id, vol);
          pcent >= 1 && this._fades.splice(i, 1);
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  ButtonAnimation: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1a7c627L+pGjIq/8YFsoIGH", "ButtonAnimation");
    "use strict";
    var ACTION_TIME = .2;
    var ButtonTypes;
    ButtonTypes = cc.Enum({
      Scale: 0,
      Tint: 1,
      ScaleTint: 2,
      Bounce: 3,
      None: 4
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        buttonType: {
          default: ButtonTypes.ScaleTint,
          type: ButtonTypes
        },
        bounciness: {
          default: 1,
          visible: function visible() {
            return this.buttonType === ButtonTypes.Bounce;
          }
        },
        clickAudioClip: {
          default: null,
          url: cc.AudioClip
        }
      },
      onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onButtonDown, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onButtonUp, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onButtonMove, this);
        this._down = false;
        this._startScale = this.node.scale;
      },
      spawnIn: function spawnIn() {
        var delay = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
        if (this.buttonType !== ButtonTypes.Bounce) return;
        this.node.stopAllActions();
        this.node.scaleX = .35;
        this.node.scaleY = 0;
        delay > 0 ? this.scheduleOnce(this._idleStart, delay) : this._idleStart();
      },
      _onButtonDown: function _onButtonDown(touch) {
        if (!this.node.getComponent("cc.Button").interactable) return;
        if (this.buttonType === ButtonTypes.Bounce) {
          this.node.stopAllActions();
          var rotTarget = Math.random() * Math.PI / 128 - Math.PI / 256 * this.bounciness;
          rotTarget *= 100;
          var downAction = cc.spawn(cc.scaleTo(.1, 1 - .2 * this.bounciness), cc.tintTo(.1, 216, 216, 216), cc.rotateTo(.1, rotTarget));
          downAction.easing(cc.easeQuadraticActionOut());
          var upAction = cc.spawn(cc.scaleTo(.25, 1 - .12 * this.bounciness), cc.rotateTo(.25, -rotTarget / 2));
          downAction.easing(cc.easeQuadraticActionInOut());
          var sequence = cc.sequence(downAction, upAction, cc.callFunc(this._downWobbleCallback, this));
          this.node.runAction(sequence);
        } else {
          this.buttonType !== ButtonTypes.Scale && this.buttonType !== ButtonTypes.ScaleTint || this.node.runAction(cc.scaleTo(ACTION_TIME, .95).easing(cc.easeSineOut()));
          this.buttonType !== ButtonTypes.Tint && this.buttonType !== ButtonTypes.ScaleTint || this.node.runAction(cc.tintTo(ACTION_TIME, 127.5, 127.5, 127.5).easing(cc.easeSineOut()));
        }
        this._down = true;
      },
      _onButtonMove: function _onButtonMove(touch) {
        if (!this.node.getComponent("cc.Button").interactable) return;
        var location = touch.getLocation();
        location = this.node.parent.convertToNodeSpace(location);
        location.x -= this.node.parent.width / 2;
        location.y -= this.node.parent.height / 2;
        var inside = cc.rectContainsPoint(this.node.getBoundingBox(), location);
        if (inside === this._down) return;
        this._down = inside;
        inside ? this._onButtonDown(touch) : this._onButtonUp(touch);
      },
      _onButtonUp: function _onButtonUp(touch) {
        if (!this.node.getComponent("cc.Button").interactable) return;
        if (this.buttonType === ButtonTypes.Bounce) {
          this.node.stopAllActions();
          this._idleStart();
        } else {
          this.buttonType !== ButtonTypes.Scale && this.buttonType !== ButtonTypes.ScaleTint || this.node.runAction(cc.scaleTo(ACTION_TIME, 1).easing(cc.easeSineOut()));
          this.buttonType !== ButtonTypes.Tint && this.buttonType !== ButtonTypes.ScaleTint || this.node.runAction(cc.tintTo(ACTION_TIME, 255, 255, 255).easing(cc.easeSineOut()));
        }
        if (this._down && null != this.clickAudioClip) {
          require("AudioManager").instance.playSound(this.clickAudioClip);
          this._down = false;
        }
      },
      _downWobbleCallback: function _downWobbleCallback() {
        var scaler = 1 - .15 * this.bounciness;
        var downAction = cc.spawn(cc.scaleTo(.45, scaler - .01, scaler + .01), cc.rotateTo(.45, 0));
        downAction.easing(cc.easeQuadraticActionInOut());
        var upAction = cc.scaleTo(.45, scaler + .01, scaler - .01);
        downAction.easing(cc.easeQuadraticActionInOut());
        var sequence = cc.sequence(downAction, upAction, cc.callFunc(this._downWobbleCallback, this));
        this.node.runAction(sequence);
      },
      _idleStart: function _idleStart() {
        var rotTarget = Math.random() * Math.PI / 64 - Math.PI / 128 * this.bounciness;
        rotTarget *= 100;
        var downAction = cc.spawn(cc.scaleTo(.15, this._startScale + .075 * this.bounciness, this._startScale - .08 * this.bounciness), cc.tintTo(.15, 255, 255, 255), cc.rotateTo(.15, 0));
        downAction.easing(cc.easeQuadraticActionInOut());
        var upAction = cc.spawn(cc.scaleTo(.35, this._startScale - .05 * this.bounciness, this._startScale + .01 * this.bounciness), cc.rotateTo(.35, -rotTarget / 2));
        downAction.easing(cc.easeQuadraticActionInOut());
        var sequence = cc.sequence(downAction, upAction, cc.callFunc(this._idleWobbleCallback, this));
        this.node.runAction(sequence);
      },
      _idleWobbleCallback: function _idleWobbleCallback() {
        var downAction = cc.spawn(cc.scaleTo(.45, this._startScale - .01, this._startScale + .01), cc.rotateTo(.45, 0));
        downAction.easing(cc.easeQuadraticActionInOut());
        var upAction = cc.scaleTo(.45, this._startScale + .01, this._startScale - .01);
        downAction.easing(cc.easeQuadraticActionInOut());
        var sequence = cc.sequence(downAction, upAction, cc.callFunc(this._idleWobbleCallback, this));
        this.node.runAction(sequence);
      }
    });
    cc._RF.pop();
  }, {
    AudioManager: "AudioManager"
  } ],
  ColorCard: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7dd19FnnxdJxrjul+kyDNSK", "ColorCard");
    "use strict";
    var TUTORIAL_WORDS = [ "Green", "Blue" ];
    var TUTORIAL_COLORS = [ new cc.Color(24, 176, 107), new cc.Color(42, 143, 230) ];
    var WORDS = [ "RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "VIOLET" ];
    var COLORS = [ new cc.Color(224, 89, 89), new cc.Color(233, 131, 73), new cc.Color(235, 208, 1), new cc.Color(24, 176, 107), new cc.Color(42, 143, 230), new cc.Color(167, 98, 184) ];
    cc.Class({
      extends: cc.Component,
      properties: {
        wordLabel: {
          default: null,
          type: cc.Label
        },
        secondLabel: {
          default: null,
          type: cc.Label
        },
        penaltySprite: {
          default: null,
          type: cc.Sprite
        }
      },
      onLoad: function onLoad() {
        this.secondLabel.node.active = false;
        this._swiping = false;
        this._penaltyTime = 0;
        this._penaltyLength = 0;
        this._tutorialMode = false;
        Object.defineProperties(this, {
          valid: {
            get: function get() {
              return this._word === this._color;
            }
          },
          word: {
            get: function get() {
              return this._word;
            }
          },
          color: {
            get: function get() {
              return this._color;
            }
          },
          swiping: {
            get: function get() {
              return this._swiping;
            }
          },
          tutorialMode: {
            get: function get() {
              return this._tutorialMode;
            },
            set: function set(val) {
              this._tutorialMode = val;
            }
          }
        });
      },
      start: function start() {
        this.reset();
      },
      update: function update(dt) {
        if (this._penaltyTime > 0) {
          this._penaltyTime -= dt;
          this.penaltySprite.fillRange = .5 + this._penaltyTime / this._penaltyLength * .5;
          this._penaltyTime <= 0 && (this._penaltyTime = 0);
        }
      },
      swipe: function swipe(last) {
        var x = this.valid ? cc.Canvas.instance.designResolution.width : -cc.Canvas.instance.designResolution.width;
        var y = -this.node.height;
        var rot = this.valid ? Math.floor(30 * Math.random()) + 45 : -(Math.floor(30 * Math.random()) + 45);
        this.node.runAction(cc.sequence(cc.moveBy(.5, x, 0).easing(cc.easeQuadraticActionOut()), cc.callFunc(function() {
          this.node.setSiblingIndex(1);
          this.reset();
          last && (this.node.active = false);
        }, this)));
        this.node.runAction(cc.moveBy(.3, 0, y).easing(cc.easeCircleActionIn()));
        this.node.runAction(cc.rotateBy(.3, rot).easing(cc.easeCircleActionOut()));
        this._swiping = true;
      },
      penalty: function penalty(time) {
        this._penaltyTime = time;
        this._penaltyLength = time;
        this.secondLabel.node.active = true;
        this.secondLabel.node.opacity = 0;
        this.secondLabel.string = "Whoops";
        this.secondLabel.node.runAction(cc.fadeIn(.33).easing(cc.easeSineIn()));
        this.secondLabel.node.runAction(cc.sequence(cc.delayTime(time - .33), cc.fadeOut(.33).easing(cc.easeSineOut()), cc.callFunc(function() {
          this.secondLabel.node.active = false;
          this.penaltySprite.node.parent.active = false;
        }, this)));
        this.penaltySprite.node.parent.active = true;
        this.penaltySprite.node.parent.opacity = 0;
        this.penaltySprite.node.parent.runAction(cc.fadeIn(.33).easing(cc.easeSineIn()));
        this.penaltySprite.fillRange = 1;
      },
      reset: function reset() {
        this.node.getNumberOfRunningActions() > 0 && this.node.stopAllActions();
        this.node.rotation = 0;
        this.node.x = 0;
        this.node.y = 22;
        this._swiping = false;
        var isValid = Math.random() > .5;
        this._getNewColor();
        while (this.valid !== isValid) this._getNewColor();
      },
      _getNewColor: function _getNewColor() {
        if (this._tutorialMode) {
          this._word = Math.floor(Math.random() * TUTORIAL_WORDS.length);
          this.wordLabel.string = TUTORIAL_WORDS[this._word];
          this._color = Math.floor(Math.random() * TUTORIAL_COLORS.length);
          this.wordLabel.node.color = TUTORIAL_COLORS[this._color];
        } else {
          this._word = Math.floor(Math.random() * WORDS.length);
          this.wordLabel.string = WORDS[this._word];
          this._color = Math.floor(Math.random() * COLORS.length);
          this.wordLabel.node.color = COLORS[this._color];
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  CountdownCircle: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a5733vdEUpMDbKEwxiwlGhv", "CountdownCircle");
    "use strict";
    var FILL_SPEED = 33;
    cc.Class({
      extends: cc.Component,
      properties: {
        countLabel: {
          default: null,
          type: cc.Label
        },
        levelLabel: {
          default: null,
          type: cc.Label
        },
        fillSprite: {
          default: null,
          type: cc.Sprite
        },
        countdownNode: {
          default: null,
          type: cc.Node
        },
        wellDoneNode: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        this._countdownTime = 3;
        this._time = 0;
        this._countingDown = false;
        Object.defineProperties(this, {});
      },
      start: function start() {
        this.node.scale = 0;
      },
      update: function update(dt) {
        if (this._countingDown) {
          this._time += dt;
          if (this._time >= this._countdownTime) {
            this._time = this._countdownTime;
            this._countingDown = false;
            this.hide();
          }
          this.fillSprite.fillRange = -this._time / this._countdownTime;
          this.countLabel.string = this._countingDown ? Math.ceil(this._countdownTime - this._time) : "GO!";
        }
      },
      countdown: function countdown(time, level) {
        this._countdownTime = time;
        this._time = 0;
        this.node.scale = 0;
        this.countdownNode.active = true;
        this.wellDoneNode.active = false;
        this.levelLabel.node.active = true;
        this.levelLabel.string = level.toString() + "\nLEVEL";
        this.countLabel.node.active = false;
        this.fillSprite.fillRange = 0;
        this.node.runAction(cc.sequence(cc.scaleTo(.33, 1).easing(cc.easeBackOut()), cc.delayTime(2), cc.callFunc(function() {
          this.levelLabel.node.runAction(cc.fadeOut(.33).easing(cc.easeSineOut()));
          this.countLabel.node.active = true;
          this.countLabel.node.opacity = 0;
          this.countLabel.node.runAction(cc.fadeIn(.33).easing(cc.easeSineIn()));
          this._countingDown = true;
        }, this)));
        this.countdownNode.opacity = 0;
        this.countdownNode.runAction(cc.fadeIn(.33).easing(cc.easeSineIn()));
        return time + 2 + .66;
      },
      wellDone: function wellDone() {
        this.node.scale = 0;
        this.countdownNode.active = false;
        this.wellDoneNode.active = true;
        this.node.runAction(cc.sequence(cc.scaleTo(.33, 1).easing(cc.easeBackOut()), cc.delayTime(3), cc.callFunc(function() {
          this.hide();
        }, this)));
        this.wellDoneNode.opacity = 0;
        this.wellDoneNode.runAction(cc.fadeIn(.33).easing(cc.easeSineIn()));
        return 3.66;
      },
      hide: function hide() {
        this.node.runAction(cc.scaleTo(.33, 0).easing(cc.easeBackIn()));
        this.countdownNode.active && this.countdownNode.runAction(cc.fadeOut(.33).easing(cc.easeSineOut()));
        this.wellDoneNode.active && this.wellDoneNode.runAction(cc.fadeOut(.33).easing(cc.easeSineOut()));
      }
    });
    cc._RF.pop();
  }, {} ],
  DataController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "43cc8Qjw7NHt6WcU4OPLNNf", "DataController");
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    var DataController = function DataController() {
      _classCallCheck(this, DataController);
      this._tables = new Map();
      this.init = function(files) {
        for (var i = 0; i < files.length; i++) this._load(files[i]);
      };
      this._load = function(name) {
        var c = this._callbackLoad.bind(this);
        cc.loader.loadRes("data/" + name, function(error, json) {
          c(error, json, name);
        });
      };
      this._callbackLoad = function(error, json, name) {
        if (error) {
          cc.log(error.message);
          require("AnalyticsController").instance.logErrorEvent(error.stack);
        } else this._tables.set(name, json);
      };
      this.tableExists = function(key) {
        return this._tables.has(key);
      };
      this.getTable = function(tableId) {
        return this._tables.get(tableId);
      };
      this.getData = function(tableId, objectId) {
        return this._tables.get(tableId)[objectId];
      };
    };
    DataController.instance = new DataController();
    module.exports = DataController;
    cc._RF.pop();
  }, {
    AnalyticsController: "AnalyticsController"
  } ],
  FSM: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d52004f7W1CT4HV1GanW+YI", "FSM");
    "use strict";
    var INITIAL_STATE = -1;
    function FSM() {
      this._state = INITIAL_STATE;
      this._delegateEnter = null;
      this._delegateUpdate = null;
      this._delegateExit = null;
      this._time = 0;
      this._dt = 0;
      Object.defineProperties(this, {
        enterDelegate: {
          get: function get() {
            return this._delegateEnter;
          },
          set: function set(del) {
            this._delegateEnter = del;
          }
        },
        updateDelegate: {
          get: function get() {
            return this._delegateUpdate;
          },
          set: function set(del) {
            this._delegateUpdate = del;
          }
        },
        exitDelegate: {
          get: function get() {
            return this._delegateExit;
          },
          set: function set(del) {
            this._delegateExit = del;
          }
        },
        time: {
          get: function get() {
            return this._time;
          }
        },
        dt: {
          get: function get() {
            return this._dt;
          }
        },
        state: {
          get: function get() {
            return this._state;
          },
          set: function set(val) {
            this._delegateExit && this._state !== INITIAL_STATE && this._delegateExit(this, this._state);
            this._state = val;
            this._time = 0;
            this._delegateEnter && this._delegateEnter(this, this._state);
          }
        }
      });
      this.update = function(dt) {
        this._delegateUpdate && this._delegateUpdate(this, this._state);
        this._time += dt;
        this._dt = dt;
      };
    }
    module.exports = FSM;
    cc._RF.pop();
  }, {} ],
  IncrementLabelNumber: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "27352NAy6NGZoc/Cu07/uOI", "IncrementLabelNumber");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        clickAudioClip: {
          default: null,
          url: cc.AudioClip
        }
      },
      onLoad: function onLoad() {
        this._delay = 0;
        this._length = 0;
        this._time = 0;
        this._startNumber = 0;
        this._targetNumber = 0;
        Object.defineProperties(this, {});
      },
      update: function update(dt) {
        if (this._length > 0) {
          this._time += dt;
          if (this._time > this._delay) {
            var str = Math.floor(this._startNumber + (this._time - this._delay) / this._length * (this._targetNumber - this._startNumber)).toString();
            if (this._label.string !== str) {
              this._label.string = str;
              this.clickAudioClip && require("AudioManager").instance.playSound(this.clickAudioClip);
            }
          }
          this._time > this._delay + this._length && this.reset();
        }
      },
      init: function init(delay, length, startNumber, targetNumber) {
        this._delay = delay;
        this._startNumber = startNumber;
        this._targetNumber = targetNumber;
        this._length = length;
        this._label = this.node.getComponent(cc.Label);
      },
      reset: function reset() {
        this._label.string = this._targetNumber.toString();
        this._delay = 0;
        this._length = 0;
        this._time = 0;
        this._startNumber = 0;
        this._targetNumber = 0;
      }
    });
    cc._RF.pop();
  }, {
    AudioManager: "AudioManager"
  } ],
  KeyboardButtonSwitcher: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dab44xtJdtOJahvquxQa4bg", "KeyboardButtonSwitcher");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        startValue: {
          default: true
        },
        buttonSprite: {
          default: null,
          type: cc.Sprite
        },
        arrowSprite: {
          default: null,
          type: cc.Sprite
        },
        buttonSpriteFrames: {
          default: [],
          type: cc.SpriteFrame
        },
        arrowSpriteFrames: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      onLoad: function onLoad() {
        this._on = this.startValue;
        this._run();
      },
      _run: function _run() {
        var index = this._on ? 0 : 1;
        this.buttonSprite.spriteFrame = this.buttonSpriteFrames[index];
        this.arrowSprite.spriteFrame = this.arrowSpriteFrames[index];
        this._on = !this._on;
        this.node.runAction(cc.sequence(cc.delayTime(1.33), cc.callFunc(function() {
          this._run();
        }, this)));
      }
    });
    cc._RF.pop();
  }, {} ],
  LabelFontLoader: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "72aa3snwYlA1rnyX12pEneo", "LabelFontLoader");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        defaultFont: {
          default: null,
          type: cc.Font
        }
      },
      onLoad: function onLoad() {
        var label = this.node.getComponent("cc.Label");
        if (label) {
          cc.sys.localStorage.getItem("language") !== cc.sys.LANGUAGE_ARABIC && cc.sys.localStorage.getItem("language") !== cc.sys.LANGUAGE_ROMANIAN && (label.font = this.defaultFont);
          return;
        }
        var rich = this.node.getComponent("cc.RichText");
        if (rich) {
          cc.sys.localStorage.getItem("language") !== cc.sys.LANGUAGE_ARABIC && cc.sys.localStorage.getItem("language") !== cc.sys.LANGUAGE_ROMANIAN && (rich.font = this.defaultFont);
          return;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  LevelNode: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4c272GrUHFMIbYV7c9f7EGM", "LevelNode");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        openNode: {
          default: null,
          type: cc.Node
        },
        lockedNode: {
          default: null,
          type: cc.Node
        },
        completedNode: {
          default: null,
          type: cc.Node
        },
        levelLabels: {
          default: [],
          type: cc.Label
        }
      },
      onLoad: function onLoad() {
        this._level = 1;
        this._open = true;
        this._completed = false;
        Object.defineProperties(this, {
          level: {
            get: function get() {
              return this._level;
            }
          },
          open: {
            get: function get() {
              return this._open;
            }
          },
          completed: {
            get: function get() {
              return this._completed;
            }
          }
        });
      },
      init: function init(level) {
        var current = require("SaveManager").instance.furthestLevel;
        this._level = level;
        this._open = current >= level || require("SaveManager").instance.tutorialActive && 1 === this._level;
        this._completed = level < current;
        var json = require("DataController").instance.getTable("levels");
        this.completedNode.active = require("SaveManager").instance.getLevelPoints(level) >= json[level - 1].pass;
        this.openNode.active = !this.completedNode.active;
        this.lockedNode.active = !this._open;
        this.node.getComponent(cc.Button).interactable = this._open;
        for (var i = 0; i < this.levelLabels.length; i++) this.levelLabels[i].string = level.toString();
      }
    });
    cc._RF.pop();
  }, {
    DataController: "DataController",
    SaveManager: "SaveManager"
  } ],
  LevelSelect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3b14fpX7q5JQoErTfMfop5K", "LevelSelect");
    "use strict";
    var MAX_LEVEL = 30;
    var SCROLL_TIME = .66;
    cc.Class({
      extends: cc.Component,
      properties: {
        foregroundSprite: {
          default: null,
          type: cc.Sprite
        },
        levelPageNodes: {
          default: [],
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        require("SaveManager").instance || cc.log("Please start project from Load game scene.");
        this._pageIndex = 0;
        this._jsonLoaded = false;
        cc.director.preloadScene("game", function(error) {
          if (error) {
            cc.log(error);
            return;
          }
        });
      },
      start: function start() {
        this.foregroundSprite.node.active = true;
        this.foregroundSprite.node.runAction(cc.sequence(cc.fadeOut(2).easing(cc.easeSineOut()), cc.callFunc(function() {
          this.foregroundSprite.node.active = false;
        }, this)));
      },
      update: function update(dt) {
        if (this._jsonLoaded || !require("DataController").instance.tableExists("levels") || !require("SaveManager").instance.userDataLoaded) return;
        this._setupPages();
        this._jsonLoaded = true;
      },
      _setupPages: function _setupPages() {
        var index = 1;
        var current = require("SaveManager").instance.furthestLevel;
        this._pageIndex = Math.floor((current + 1) / 10);
        for (var i = 0; i < this.levelPageNodes.length; i++) {
          this.levelPageNodes[i].children.forEach(function(child) {
            index <= MAX_LEVEL ? child.getComponent("LevelNode").init(index) : child.active = false;
            index++;
          });
          this.levelPageNodes[i].active = i === this._pageIndex;
        }
      },
      levelClicked: function levelClicked(event) {
        var level = event.target.getComponent("LevelNode").level;
        cc.sys.localStorage.setItem("bt_word_colors_level_selected", level.toString());
        this._loadGame();
      },
      leftArrowClicked: function leftArrowClicked() {
        if (0 === this._pageIndex || this.levelPageNodes[this._pageIndex].getNumberOfRunningActions() > 0) return;
        var prev = this.levelPageNodes[this._pageIndex];
        this.levelPageNodes[this._pageIndex].runAction(cc.sequence(cc.moveBy(SCROLL_TIME, cc.Canvas.instance.designResolution.width, 0).easing(cc.easeSineInOut()), cc.callFunc(function() {
          prev.active = false;
        }, this)));
        this._pageIndex--;
        this.levelPageNodes[this._pageIndex].active = true;
        this.levelPageNodes[this._pageIndex].x = -cc.Canvas.instance.designResolution.width;
        this.levelPageNodes[this._pageIndex].runAction(cc.moveBy(SCROLL_TIME, cc.Canvas.instance.designResolution.width, 0).easing(cc.easeSineInOut()));
      },
      rightArrowClicked: function rightArrowClicked() {
        if (this._pageIndex === this.levelPageNodes.length - 1 || this.levelPageNodes[this._pageIndex].getNumberOfRunningActions() > 0) return;
        var prev = this.levelPageNodes[this._pageIndex];
        this.levelPageNodes[this._pageIndex].runAction(cc.sequence(cc.moveBy(SCROLL_TIME, -cc.Canvas.instance.designResolution.width, 0).easing(cc.easeSineInOut()), cc.callFunc(function() {
          prev.active = false;
        }, this)));
        this._pageIndex++;
        this.levelPageNodes[this._pageIndex].active = true;
        this.levelPageNodes[this._pageIndex].x = cc.Canvas.instance.designResolution.width;
        this.levelPageNodes[this._pageIndex].runAction(cc.moveBy(SCROLL_TIME, -cc.Canvas.instance.designResolution.width, 0).easing(cc.easeSineInOut()));
      },
      _loadGame: function _loadGame() {
        cc.director.loadScene("game");
      }
    });
    cc._RF.pop();
  }, {
    DataController: "DataController",
    SaveManager: "SaveManager"
  } ],
  Load: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b7ad0C/r+1Db4P+5XlxweWa", "Load");
    "use strict";
    var RESOURCE_DATA_FILES = [ "levels" ];
    var SUPPORTED_LANGUAGES = [ "en" ];
    cc.Class({
      extends: cc.Component,
      properties: {
        debug: {
          default: true
        },
        dailyTraining: {
          default: true
        }
      },
      onLoad: function onLoad() {
        this._setLanguage();
        require("Localization").instance.init(SUPPORTED_LANGUAGES);
        require("DataController").instance.init(RESOURCE_DATA_FILES);
        cc.sys.localStorage.getItem("bt_word_colors_level") || cc.sys.localStorage.setItem("bt_word_colors_level", "0");
        cc.director.preloadScene("start", function(error) {
          if (error) {
            cc.log(error);
            return;
          }
        });
        cc.director.preloadScene("levelselect", function(error) {
          if (error) {
            cc.log(error);
            return;
          }
        });
      },
      start: function start() {
        require("AnalyticsController").instance.disabled = this.debug;
        require("SaveManager").instance.dailyTraining = this.dailyTraining;
        this._load();
      },
      _setLanguage: function _setLanguage() {
        cc.sys.localStorage.getItem("language") || (require("Localization").instance.languageSupported(cc.sys.language) ? cc.sys.localStorage.setItem("language", cc.sys.language) : cc.sys.localStorage.setItem("language", cc.sys.LANGUAGE_ENGLISH));
      },
      _load: function _load() {
        this.dailyTraining ? cc.director.loadScene("start") : cc.director.loadScene("levelselect");
      }
    });
    cc._RF.pop();
  }, {
    AnalyticsController: "AnalyticsController",
    DataController: "DataController",
    Localization: "Localization",
    SaveManager: "SaveManager"
  } ],
  Localization: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a7e5a5uEuFEcpOCBYhK/qEx", "Localization");
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    var Localization = function Localization() {
      _classCallCheck(this, Localization);
      this._tables = new Map();
      this._supported = [];
      this.init = function(supported) {
        this._supported = supported;
        for (var i = 0; i < this._supported.length; i++) this._load("locale_" + this._supported[i]);
      };
      this._load = function(name) {
        var c = this._callbackLoad.bind(this);
        cc.loader.loadRes("data/" + name, function(error, json) {
          c(error, json, name);
        });
      };
      this._callbackLoad = function(error, json, name) {
        error ? cc.log(error.message) : this._tables.set(name, json);
      };
      this.getString = function(objectId) {
        if (this._tables.get("locale_" + cc.sys.localStorage.getItem("language")) && this._tables.get("locale_" + cc.sys.localStorage.getItem("language")).hasOwnProperty(objectId)) return this._tables.get("locale_" + cc.sys.localStorage.getItem("language"))[objectId];
        return objectId;
      };
      this.languageSupported = function(langCode) {
        return this._supported.indexOf(langCode) >= 0;
      };
    };
    Localization.instance = new Localization();
    module.exports = Localization;
    cc._RF.pop();
  }, {} ],
  LocalizeLabel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "766f0XBg0lPcaKV7YjUzFMj", "LocalizeLabel");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        richTextStringId: {
          default: ""
        }
      },
      onLoad: function onLoad() {
        var label = this.node.getComponent("cc.Label");
        if (label) {
          label.string = require("Localization").instance.getString(label.string);
          return;
        }
        var rich = this.node.getComponent("cc.RichText");
        if (rich) {
          rich.string = rich.string.replace(this.richTextStringId, require("Localization").instance.getString(this.richTextStringId));
          return;
        }
      }
    });
    cc._RF.pop();
  }, {
    Localization: "Localization"
  } ],
  LosePopup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4ecb0U0QnpNVq/qHus9oX3J", "LosePopup");
    "use strict";
    var FILL_SPEED = 200;
    var Popup = require("Popup");
    cc.Class({
      extends: Popup,
      properties: {
        scoreLabel: {
          default: null,
          type: cc.Label
        },
        messageLabel: {
          default: null,
          type: cc.RichText
        },
        fillSprite: {
          default: null,
          type: cc.Sprite
        },
        passSprite: {
          default: null,
          type: cc.Sprite
        },
        retryButton: {
          default: null,
          type: cc.Button
        },
        continueButton: {
          default: null,
          type: cc.Button
        }
      },
      onLoad: function onLoad() {
        Popup.prototype.onLoad.call(this);
        this._messageString = this.messageLabel.string;
        this._synced = true;
      },
      update: function update(dt) {
        if (!this._synced) {
          this.fillSprite.node.width = this.fillSprite.node.width + FILL_SPEED * dt;
          if (this.fillSprite.node.width > this.fillSprite.node.parent.width * this._fillPcent) {
            this.fillSprite.node.width = this.fillSprite.node.parent.width * this._fillPcent;
            this._synced = true;
          }
        }
      },
      init: function init(score, passGoal, perfectGoal) {
        this._fillPcent = score / perfectGoal;
        this._passPcent = passGoal / perfectGoal;
        this.scoreLabel.string = score.toString() + "/" + perfectGoal.toString();
        this.messageLabel.string = this._messageString.replace("%n%", (passGoal - score).toString());
        this.passSprite.node.x = -this.passSprite.node.parent.width / 2 + this.passSprite.node.parent.width * this._passPcent;
        this.fillSprite.node.width = 0;
        this._synced = false;
      }
    });
    cc._RF.pop();
  }, {
    Popup: "Popup"
  } ],
  Popup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "07523F5OrpLgq9xg2/lVfFV", "Popup");
    "use strict";
    var OpenAnimations;
    OpenAnimations = cc.Enum({
      Drop: 0,
      Scale: 1
    });
    cc.Class({
      extends: cc.Component,
      properties: {
        startOpen: {
          default: false
        },
        backDropClickable: {
          default: true
        },
        backDropVisible: {
          default: true
        },
        backDrop: {
          default: null,
          type: cc.Node
        },
        mainContainer: {
          default: null,
          type: cc.Node
        },
        openAnimation: {
          default: OpenAnimations.Drop,
          type: OpenAnimations
        },
        openTime: {
          default: .5
        },
        closeTime: {
          default: .5
        }
      },
      onLoad: function onLoad() {
        this._popupWillOpenCallback = null;
        this._popupDidOpenCallback = null;
        this._popupWillCloseCallback = null;
        this._popupDidCloseCallback = null;
        this._startScale = this.mainContainer.scaleX;
        if (this.backDrop) {
          this.backDrop.active = false;
          if (this.backDropClickable) {
            this.backDrop.addComponent(cc.Button);
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = "Popup";
            clickEventHandler.handler = "_backDropClicked";
            this.backDrop.getComponent("cc.Button").clickEvents = [];
            this.backDrop.getComponent("cc.Button").clickEvents.push(clickEventHandler);
          } else this.backDrop.addComponent(cc.BlockInputEvents);
        }
        this._open = this.startOpen;
        this.mainContainer.active = this._open;
        if (this._open) {
          this._openBackDrop();
          this._popupDidOpen();
          this._popupDidOpenCallback && this._popupDidOpenCallback();
        }
        Object.defineProperties(this, {
          open: {
            get: function get() {
              return this._open;
            }
          },
          popupWillOpen: {
            get: function get() {
              return this._popupWillOpenCallback;
            },
            set: function set(func) {
              this._popupWillOpenCallback = func;
            }
          },
          popupDidOpen: {
            get: function get() {
              return this._popupDidOpenCallback;
            },
            set: function set(func) {
              this._popupDidOpenCallback = func;
            }
          },
          popupDidClose: {
            get: function get() {
              return this._popupDidCloseCallback;
            },
            set: function set(func) {
              this._popupDidCloseCallback = func;
            }
          },
          popupWillClose: {
            get: function get() {
              return this._popupWillCloseCallback;
            },
            set: function set(func) {
              this._popupWillCloseCallback = func;
            }
          }
        });
      },
      _popupWillOpen: function _popupWillOpen() {},
      _popupDidOpen: function _popupDidOpen() {},
      _popupWillClose: function _popupWillClose() {},
      _popupDidClose: function _popupDidClose() {},
      _backDropClicked: function _backDropClicked() {
        this.closePopup();
      },
      openPopup: function openPopup() {
        if (!this._open) {
          this.mainContainer.active = true;
          this._popupWillOpen();
          this._popupWillOpenCallback && this._popupWillOpenCallback();
          var tests = this.mainContainer.getComponentsInChildren("ButtonAnimation");
          for (var i = 0; i < tests.length; i++) tests[i].spawnIn(this.openTime);
          this._openBackDrop();
          var actionCallback = function actionCallback() {
            this._popupDidOpen();
            this._popupDidOpenCallback && this._popupDidOpenCallback();
            this._open = true;
          };
          if (this.openAnimation === OpenAnimations.Drop) {
            this.mainContainer.y = this.node.height;
            var dropIn = cc.sequence(cc.moveTo(this.openTime, 0, 0).easing(cc.easeBackOut()), cc.callFunc(actionCallback, this));
            this.mainContainer.runAction(dropIn);
          } else if (this.openAnimation === OpenAnimations.Scale) {
            this.mainContainer.opacity = 0;
            this.mainContainer.scale = 0;
            var fadeIn = cc.sequence(cc.fadeIn(this.openTime).easing(cc.easeSineIn()), cc.callFunc(actionCallback, this));
            this.mainContainer.runAction(fadeIn);
            this.mainContainer.runAction(cc.scaleTo(this.openTime, this._startScale).easing(cc.easeSineIn()));
          }
        }
      },
      closePopup: function closePopup() {
        if (this._open) {
          this._popupWillClose();
          this._popupWillCloseCallback && this._popupWillCloseCallback();
          this._closeBackDrop();
          var actionCallback = function actionCallback() {
            this._popupDidClose();
            this._popupDidCloseCallback && this._popupDidCloseCallback();
            this.mainContainer.active = false;
            this._open = false;
          };
          if (this.openAnimation === OpenAnimations.Drop) {
            var dropOut = cc.sequence(cc.moveTo(this.closeTime, 0, -this.node.height).easing(cc.easeBackIn()), cc.callFunc(actionCallback, this));
            this.mainContainer.runAction(dropOut);
          } else if (this.openAnimation === OpenAnimations.Scale) {
            var fadeOut = cc.sequence(cc.fadeOut(this.closeTime).easing(cc.easeSineIn()), cc.callFunc(actionCallback, this));
            this.mainContainer.runAction(fadeOut);
            this.mainContainer.runAction(cc.scaleTo(this.closeTime, 0).easing(cc.easeSineIn()));
          }
        }
      },
      _openBackDrop: function _openBackDrop() {
        if (null === this.backDrop) return;
        this.backDrop.active = true;
        this.backDrop.opacity = 0;
        var fadeTarget = this.backDropVisible ? 200 : 0;
        this.backDrop.runAction(cc.fadeTo(this.openTime, fadeTarget).easing(cc.easeSineIn()));
      },
      _closeBackDrop: function _closeBackDrop() {
        if (null === this.backDrop) return;
        var fadeOut = cc.sequence(cc.fadeTo(this.closeTime, 0).easing(cc.easeSineIn()), cc.callFunc(function() {
          this.backDrop.active = false;
        }, this));
        this.backDrop.runAction(fadeOut);
      }
    });
    cc._RF.pop();
  }, {} ],
  SaveManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "46bcfWJVRpGzoDMp6qdkvF7", "SaveManager");
    "use strict";
    var SaveManager = cc.Class({
      extends: cc.Component,
      properties: {
        projectId: {
          default: ""
        },
        gameId: {
          default: ""
        }
      },
      statics: {
        instance: null
      },
      onLoad: function onLoad() {
        SaveManager.instance = this;
        cc.game.addPersistRootNode(this.node);
        this._dailyTrainingActive = false;
        this._data = [];
        this._furthestLevel = 0;
        this._userDataLoaded = false;
        this._userId = "";
        this._accessToken = "";
        this._projectId = "";

        Object.defineProperties(this, {
          dailyTraining: {
            get: function get() {
              return this._dailyTrainingActive;
            },
            set: function set(val) {
              this._dailyTrainingActive = val;
            }
          },
          furthestLevel: {
            get: function get() {
              return this._furthestLevel;
            }
          },
          tutorialActive: {
            get: function get() {
              return 0 === this._furthestLevel;
            },
            set: function set(val) {
              this._furthestLevel = val ? 0 : 1;
            }
          },
          userDataLoaded: {
            get: function get() {
              return this._userDataLoaded;
            }
          },
          userId: {
            get: function get() {
              return this._userId;
            }
          }
        });
      },
      start: function start() {
        var urlParams = new URLSearchParams(window.location.search);
        cc.log(urlParams);
        this._userId = urlParams.get("user");
        this._accessToken = urlParams.get("accessToken");
        this._projectId = urlParams.get("projectId");
        this._getPlayerGameData();
      },
      hasLevelData: function hasLevelData(level) {
        return this._data.length > level - 1 && this._data[level - 1];
      },
      getLevelPoints: function getLevelPoints(level) {
        if (this._data.length > level - 1 && this._data[level - 1]) return this._data[level - 1].points;
        return 0;
      },
      setPlayerLevelData: function setPlayerLevelData(level, score) {
        this.hasLevelData(level) ? score > this._data[level - 1].points && this._updatePlayerLevelData(level, score) : this._postPlayerLevelData(level, score);
      },
      _getPlayerGameData: function _getPlayerGameData() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (4 == this.readyState) if (200 == this.status) {
            cc.log(xhttp.responseText);
            var data = JSON.parse(xhttp.responseText);
            if (data.documents) for (var i = 0; i < data.documents.length; i++) {
              var parsedData = {};
              for (var field in data.documents[i].fields) {
                if (!data.documents[i].fields.hasOwnProperty(field)) continue;
                data.documents[i].fields[field].hasOwnProperty("stringValue") ? parsedData[field] = data.documents[i].fields[field].stringValue : data.documents[i].fields[field].hasOwnProperty("integerValue") ? parsedData[field] = parseInt(data.documents[i].fields[field].integerValue) : data.documents[i].fields[field].hasOwnProperty("timestampValue") && (parsedData[field] = data.documents[i].fields[field].timestampValue);
              }
              parsedData.name = data.documents[i].name;
              if (parsedData.game === require("SaveManager").instance.gameId) {
                require("SaveManager").instance._data[parsedData.level - 1] = parsedData;
                parsedData.level >= require("SaveManager").instance._furthestLevel && (require("SaveManager").instance._furthestLevel = parsedData.level + 1);
              }
            }
            require("SaveManager").instance._userDataLoaded = true;
            cc.log(require("SaveManager").instance._data);
          } else {
            cc.log("ERROR: " + this.status);
            cc.log(xhttp.responseText);
          }
        };
        xhttp.open("GET", "https://firestore.googleapis.com/v1/projects/" + this._projectId + "/databases/(default)/documents/users/" + this._userId + "/activity", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + this._accessToken);
        xhttp.send();
      },
      _postPlayerLevelData: function _postPlayerLevelData(level, score) {
        var data = {
          fields: {
            game: {
              stringValue: this.gameId
            },
            level: {
              integerValue: level
            },
            points: {
              integerValue: score
            },
            timestamp: {
              timestampValue: new Date().toISOString()
            }
          }
        };
        cc.log(JSON.stringify(data));
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (4 == this.readyState) if (200 == this.status) {
            cc.log(xhttp.responseText);
            var _data = JSON.parse(xhttp.responseText);
            var parsedData = {};
            for (var field in _data.fields) {
              if (!_data.fields.hasOwnProperty(field)) continue;
              _data.fields[field].hasOwnProperty("stringValue") ? parsedData[field] = _data.fields[field].stringValue : _data.fields[field].hasOwnProperty("integerValue") ? parsedData[field] = parseInt(_data.fields[field].integerValue) : _data.fields[field].hasOwnProperty("timestampValue") && (parsedData[field] = _data.fields[field].timestampValue);
            }
            parsedData.name = _data.name;
            require("SaveManager").instance._data[parsedData.level - 1] = parsedData;
            cc.log(require("SaveManager").instance._data);
            require("SaveManager").instance._furthestLevel = parsedData.level + 1;
          } else {
            cc.log("ERROR: " + this.status);
            cc.log(xhttp.responseText);
          }
        };
        xhttp.open("POST", "https://firestore.googleapis.com/v1/projects/" + this._projectId + "/databases/(default)/documents/users/" + this._userId + "/activity", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + this._accessToken);
        xhttp.send(JSON.stringify(data));
      },
      _updatePlayerLevelData: function _updatePlayerLevelData(level, score) {
        this._data[level - 1].points = score;
        this._data[level - 1].timestamp = new Date().toISOString();
        var name = this._data[level - 1].name;
        var data = {
          fields: {
            game: {
              stringValue: this.gameId
            },
            level: {
              integerValue: level
            },
            points: {
              integerValue: this._data[level - 1].points
            },
            timestamp: {
              timestampValue: this._data[level - 1].timestamp
            }
          }
        };
        cc.log(JSON.stringify(data));
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (4 == this.readyState) if (200 == this.status) cc.log(xhttp.responseText); else {
            cc.log("ERROR: " + this.status);
            cc.log(xhttp.responseText);
          }
        };
        xhttp.open("PATCH", "https://firestore.googleapis.com/v1/" + name, true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + this._accessToken);
        xhttp.send(JSON.stringify(data));
      }
    });
    cc._RF.pop();
  }, {
    SaveManager: "SaveManager"
  } ],
  ScoreProgress: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f44e5UlfwVGc4bgM45BPovA", "ScoreProgress");
    "use strict";
    var FILL_SPEED = 33;
    cc.Class({
      extends: cc.Component,
      properties: {
        scoreLabel: {
          default: null,
          type: cc.Label
        },
        fillSprite: {
          default: null,
          type: cc.Sprite
        }
      },
      onLoad: function onLoad() {
        this._score = 0;
        this._goal = 0;
        this._synced = true;
        Object.defineProperties(this, {
          score: {
            get: function get() {
              return this._score;
            }
          },
          goal: {
            get: function get() {
              return this._goal;
            },
            set: function set(val) {
              this._goal = val;
            }
          }
        });
      },
      update: function update(dt) {
        if (!this._synced) {
          var pcent = this._score / this._goal;
          this.scoreLabel.node.parent.x = this.scoreLabel.node.parent.x + FILL_SPEED * dt;
          this.scoreLabel.node.parent.x > -this.node.width / 2 + this.node.width * pcent && (this.scoreLabel.node.parent.x = -this.node.width / 2 + this.node.width * pcent);
          this.fillSprite.node.width = this.fillSprite.node.width + FILL_SPEED * dt;
          if (this.fillSprite.node.width > this.node.width * pcent) {
            this.fillSprite.node.width = this.node.width * pcent;
            this._synced = true;
          }
        }
      },
      reset: function reset() {
        this._score = 0;
        this.scoreLabel.string = this._score.toString();
        this.scoreLabel.node.parent.x = -this.node.width / 2;
        this.fillSprite.node.width = 0;
        this._synced = true;
      },
      increaseScore: function increaseScore(delta) {
        this._score += delta;
        this.scoreLabel.string = this._score.toString();
        this._synced = false;
      }
    });
    cc._RF.pop();
  }, {} ],
  SettingsButton: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47d3c2v79RFULMwwk4E0Amh", "SettingsButton");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        buttonSprite: {
          default: null,
          type: cc.Sprite
        },
        buttonLabels: {
          default: [],
          type: cc.Label
        },
        idleSpriteFrame: {
          default: null,
          type: cc.SpriteFrame
        },
        highlightedSpriteFrame: {
          default: null,
          type: cc.SpriteFrame
        },
        idleColor: {
          default: cc.Color.BLACK
        },
        highlightedColor: {
          default: cc.Color.WHITE
        }
      },
      onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this._highlight, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this._idle, this);
        this.node.on(cc.Node.EventType.MOUSE_MOVE, this._highlight, this);
        this._down = false;
      },
      _idle: function _idle() {
        this.buttonSprite.spriteFrame = this.idleSpriteFrame;
        for (var i = 0; i < this.buttonLabels.length; i++) this.buttonLabels[i].node.color = this.idleColor;
      },
      _highlight: function _highlight() {
        this.buttonSprite.spriteFrame = this.highlightedSpriteFrame;
        for (var i = 0; i < this.buttonLabels.length; i++) this.buttonLabels[i].node.color = this.highlightedColor;
      }
    });
    cc._RF.pop();
  }, {} ],
  SettingsPopup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e413aKl11pL7rx1qv8962OI", "SettingsPopup");
    "use strict";
    var Popup = require("Popup");
    cc.Class({
      extends: Popup,
      properties: {},
      onLoad: function onLoad() {
        Popup.prototype.onLoad.call(this);
      },
      onSoundPressed: function onSoundPressed() {}
    });
    cc._RF.pop();
  }, {
    Popup: "Popup"
  } ],
  Start: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6c841dI90tCpIRr43NDe33n", "Start");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        foregroundSprite: {
          default: null,
          type: cc.Sprite
        },
        levelLabel: {
          default: null,
          type: cc.Label
        },
        passLabel: {
          default: null,
          type: cc.Label
        },
        perfectLabel: {
          default: null,
          type: cc.Label
        }
      },
      onLoad: function onLoad() {
        require("SaveManager").instance || cc.log("Please start project from Load game scene.");
        this._jsonLoaded = false;
        cc.director.preloadScene("game", function(error) {
          if (error) {
            cc.log(error);
            return;
          }
        });
      },
      start: function start() {
        this.foregroundSprite.node.active = true;
        this.foregroundSprite.node.runAction(cc.sequence(cc.fadeOut(2).easing(cc.easeSineOut()), cc.callFunc(function() {
          this.foregroundSprite.node.active = false;
        }, this)));
      },
      update: function update(dt) {
        if (this._jsonLoaded || !require("DataController").instance.tableExists("levels") || !require("SaveManager").instance.userDataLoaded) return;
        var level = require("SaveManager").instance.furthestLevel;
        cc.log(level);
        0 === level ? level = 1 : level > 30 && (level = 30);
        var json = require("DataController").instance.getTable("levels");
        var passGoal = json[level - 1].pass;
        var perfectGoal = json[level - 1].perfect;
        this.levelLabel.string = "Level " + level;
        this.passLabel.string = passGoal.toString();
        this.perfectLabel.string = perfectGoal.toString();
        this._jsonLoaded = true;
      },
      playClicked: function playClicked() {
        this._loadGame();
      },
      _loadGame: function _loadGame() {
        cc.director.loadScene("game");
      }
    });
    cc._RF.pop();
  }, {
    DataController: "DataController",
    SaveManager: "SaveManager"
  } ],
  WinPopup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "eca51I7JQhM8LDn9jhpaCCJ", "WinPopup");
    "use strict";
    var FILL_SPEED = 200;
    var Popup = require("Popup");
    cc.Class({
      extends: Popup,
      properties: {
        titleLabel: {
          default: null,
          type: cc.Label
        },
        scoreLabel: {
          default: null,
          type: cc.Label
        },
        messageLabel: {
          default: null,
          type: cc.Label
        },
        fillSprite: {
          default: null,
          type: cc.Sprite
        },
        passSprite: {
          default: null,
          type: cc.Sprite
        }
      },
      onLoad: function onLoad() {
        Popup.prototype.onLoad.call(this);
        this._synced = true;
      },
      update: function update(dt) {
        if (!this._synced) {
          this.fillSprite.node.width = this.fillSprite.node.width + FILL_SPEED * dt;
          if (this.fillSprite.node.width > this.fillSprite.node.parent.width * this._fillPcent) {
            this.fillSprite.node.width = this.fillSprite.node.parent.width * this._fillPcent;
            this._synced = true;
          }
        }
      },
      init: function init(score, passGoal, perfectGoal, currentLevel) {
        this._fillPcent = score / perfectGoal;
        this._passPcent = passGoal / perfectGoal;
        this.titleLabel.string = score === perfectGoal ? "Perfect!" : "Well done!";
        this.messageLabel.string = "You unlocked a new level!";
        this.messageLabel.node.active = currentLevel;
        this.scoreLabel.string = score.toString() + "/" + perfectGoal.toString();
        this.passSprite.node.x = -this.passSprite.node.parent.width / 2 + this.passSprite.node.parent.width * this._passPcent;
        this.fillSprite.node.width = 0;
        this._synced = false;
      }
    });
    cc._RF.pop();
  }, {
    Popup: "Popup"
  } ],
  WordColors: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a41fdqauQJMWK2P96TXKpkV", "WordColors");
    "use strict";
    var GameState = cc.Enum({
      Intro: 1,
      Play: 2,
      Pause: 3,
      Next: 4,
      Exit: 5
    });
    var DEBUG_TUTORIALS = false;
    var FSM = require("FSM");
    var Popup = require("Popup");
    var ColorCard = require("ColorCard");
    var ScoreProgress = require("ScoreProgress");
    var CountdownCircle = require("CountdownCircle");
    cc.Class({
      extends: cc.Component,
      properties: {
        foregroundSprite: {
          default: null,
          type: cc.Sprite
        },
        tutorialLabel: {
          default: null,
          type: cc.Label
        },
        timeSprite: {
          default: null,
          type: cc.Sprite
        },
        answerSprites: {
          default: [],
          type: cc.Sprite
        },
        answerSpriteFrames: {
          default: [],
          type: cc.SpriteFrame
        },
        scoreProgress: {
          default: null,
          type: ScoreProgress
        },
        countdownCircle: {
          default: null,
          type: CountdownCircle
        },
        cards: {
          default: [],
          type: ColorCard
        },
        extraCards: {
          default: [],
          type: cc.Node
        },
        noButton: {
          default: null,
          type: cc.Button
        },
        yesButton: {
          default: null,
          type: cc.Button
        },
        keyboardNode: {
          default: null,
          type: cc.Node
        },
        winPopup: {
          default: null,
          type: Popup
        },
        losePopup: {
          default: null,
          type: Popup
        },
        settingsPopup: {
          default: null,
          type: Popup
        }
      },
      onLoad: function onLoad() {
        require("SaveManager").instance || cc.log("Please start project from Load game scene.");
        this._fsm = new FSM();
        this._fsm.enterDelegate = this._fsmEnter.bind(this);
        this._fsm.exitDelegate = this._fsmExit.bind(this);
        this._fsm.updateDelegate = this._fsmUpdate.bind(this);
        this._level = require("SaveManager").instance.furthestLevel;
        if (cc.sys.localStorage.getItem("bt_word_colors_level_selected")) {
          this._level = parseInt(cc.sys.localStorage.getItem("bt_word_colors_level_selected"));
          cc.sys.localStorage.removeItem("bt_word_colors_level_selected");
        }
        cc.log("LEVEL: " + this._level.toString());
        this._timeLimit = 15;
        this._perfectGoal = 14;
        this._passGoal = 12;
        this._time = 0;
        this._score = 0;
        this._penaltyActive = false;
        this._penaltyTime = 0;
        this._dailyTrainingActive = require("SaveManager").instance.dailyTraining;
        cc.game.on(cc.game.EVENT_HIDE, this._onAppEnterBackground, this);
        cc.game.on(cc.game.EVENT_SHOW, this._onAppEnterForeground, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
        this.foregroundSprite.node.active = false;
        this.tutorialLabel.node.active = false;
        this.answerSprites[0].node.active = false;
        this.answerSprites[1].node.active = false;
        this.countdownCircle.node.active = true;
      },
      onDestroy: function onDestroy() {
        cc.game.off(cc.game.EVENT_HIDE, this._onAppEnterBackground, this);
        cc.game.off(cc.game.EVENT_SHOW, this._onAppEnterForeground, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
      },
      start: function start() {
        this._fsm.state = GameState.Intro;
      },
      _onAppEnterBackground: function _onAppEnterBackground() {},
      _onAppEnterForeground: function _onAppEnterForeground() {},
      _onKeyDown: function _onKeyDown(event) {
        event.keyCode === cc.KEY.left ? this.noButton._onMouseMoveIn() : event.keyCode === cc.KEY.right && this.yesButton._onMouseMoveIn();
      },
      _onKeyUp: function _onKeyUp(event) {
        if (event.keyCode === cc.KEY.left) {
          this.onAnswerButtonPressed(event, "No");
          this.noButton._onMouseMoveOut();
          this._fsm.state === GameState.Intro && this._tutorialActive && this._startPlayState();
        } else if (event.keyCode === cc.KEY.right) {
          this.onAnswerButtonPressed(event, "Yes");
          this.yesButton._onMouseMoveOut();
          this._fsm.state === GameState.Intro && this._tutorialActive && this._startPlayState();
        }
      },
      _checkIfComplete: function _checkIfComplete() {},
      update: function update(dt) {
        this._fsm.update(dt);
      },
      _fsmEnter: function _fsmEnter(fsm, state) {
        cc.log("enter state: " + GameState[state]);
        if (state === GameState.Intro) {
          this.settingsPopup.popupDidClose = this._settingsPopupDidClose.bind(this);
          this.winPopup.popupDidClose = this._winPopupDidClose.bind(this);
          this.losePopup.popupDidClose = this._losePopupDidClose.bind(this);
          this._resetLevel();
          this.foregroundSprite.node.active = true;
          this.foregroundSprite.node.opacity = 255;
          this.keyboardNode.active = this._tutorialActive;
          this._tutorialActive || this._startPlayState();
        } else if (state === GameState.Play) if (this._tutorialActive) {
          this.cards[0].node.parent.runAction(cc.sequence(cc.delayTime(1.5), cc.moveTo(.3, 0, 0).easing(cc.easeBackOut()), cc.callFunc(function() {
            this._updateTutorialLabel("Does the meaning of this word match its font color?");
          }, this)));
          this._updateTutorialLabel("Welcome to Word Colors!");
        } else {
          this.cards[0].node.parent.runAction(cc.moveTo(.3, 0, 0).easing(cc.easeBackOut()));
          this._updateTutorialLabel("Does the meaning of this word match its font color?");
        } else if (state === GameState.Pause) {
          this.foregroundSprite.node.active = true;
          this.foregroundSprite.node.opacity = 0;
          this.foregroundSprite.node.runAction(cc.sequence(cc.fadeIn(.3).easing(cc.easeSineIn()), cc.callFunc(function() {
            this.settingsPopup.openPopup();
          }, this)));
        } else if (state === GameState.Next) {
          this.foregroundSprite.node.active = true;
          this.foregroundSprite.node.opacity = 0;
          this.foregroundSprite.node.runAction(cc.sequence(cc.fadeIn(.3).easing(cc.easeSineIn()), cc.callFunc(function() {
            this._gameOver();
          }, this)));
        }
      },
      _fsmExit: function _fsmExit(fsm, state) {
        cc.log("exit state: " + GameState[state]);
        state === GameState.Intro || state === GameState.Pause;
      },
      _fsmUpdate: function _fsmUpdate(fsm, state) {
        if (state === GameState.Intro) ; else if (state === GameState.Play) {
          this._time += this._fsm.dt;
          if (this._penaltyActive) {
            this._penaltyTime -= this._fsm.dt;
            if (this._penaltyTime <= 0) {
              this._penaltyTime = 0;
              this._penaltyActive = false;
            }
          }
          var width = cc.Canvas.instance.designResolution.width;
          this.timeSprite.node.width = width * (this._time / this._timeLimit);
          this._time >= this._timeLimit && !this._tutorialActive && this._endPuzzle();
        }
      },
      _startPlayState: function _startPlayState() {
        var actions = [];
        if (this._tutorialActive) actions.push(cc.delayTime(.5)); else {
          var delay = this.countdownCircle.countdown(3, this._level);
          actions.push(cc.delayTime(delay));
        }
        actions.push(cc.fadeOut(1).easing(cc.easeSineOut()));
        actions.push(cc.callFunc(function() {
          this.foregroundSprite.node.active = false;
          this._fsm.state = GameState.Play;
        }, this));
        this.foregroundSprite.node.runAction(cc.sequence(actions));
        this.keyboardNode.runAction(cc.fadeOut(.3));
      },
      _updateTutorialLabel: function _updateTutorialLabel(text) {
        if (this.tutorialLabel.node.active) this.tutorialLabel.node.runAction(cc.sequence(cc.fadeOut(.33).easing(cc.easeSineOut()), cc.callFunc(function() {
          this._showTutorialLabel();
          this.tutorialLabel.string = text;
        }, this))); else {
          this._showTutorialLabel();
          this.tutorialLabel.string = text;
        }
      },
      _showTutorialLabel: function _showTutorialLabel() {
        this.tutorialLabel.node.active = true;
        this.tutorialLabel.node.opacity = 0;
        this.tutorialLabel.node.runAction(cc.fadeIn(.33).easing(cc.easeSineIn()));
      },
      _hideTutorialLabel: function _hideTutorialLabel() {
        if (!this.tutorialLabel.node.active) return;
        this.tutorialLabel.node.runAction(cc.sequence(cc.fadeOut(.33).easing(cc.easeSineOut()), cc.callFunc(function() {
          this.tutorialLabel.node.active = false;
        }, this)));
      },
      onPausePressed: function onPausePressed() {
        this._fsm.state = GameState.Pause;
      },
      onRetryPressed: function onRetryPressed() {
        cc.sys.localStorage.setItem("bt_word_colors_level_selected", this._level.toString());
        this._reload();
      },
      _settingsPopupDidClose: function _settingsPopupDidClose() {
        this.foregroundSprite.node.runAction(cc.sequence(cc.fadeOut(.3).easing(cc.easeSineOut()), cc.callFunc(function() {
          this.foregroundSprite.node.active = false;
          this._fsm.state = GameState.Play;
        }, this)));
      },
      onAnswerButtonPressed: function onAnswerButtonPressed(event, answer) {
        if (this._fsm.state !== GameState.Play || this._penaltyActive) return;
        if (this.cards[0].valid && "Yes" === answer || !this.cards[0].valid && "No" === answer) {
          this._score++;
          this.scoreProgress.increaseScore(1);
          this._swipeCard(true);
          this._penaltyActive = true;
          this._penaltyTime = .25;
        } else {
          this._penaltyActive = true;
          this._penaltyTime = 1.5;
          this.cards[0].penalty(this._penaltyTime);
          this._tutorialActive && this._updateTutorialLabel("Wrong!");
          this._shakeCard();
          this.scheduleOnce(function() {
            this._swipeCard(false);
          }, this._penaltyTime);
        }
      },
      _swipeCard: function _swipeCard(correct) {
        this._tutorialActive && (2 === this._score || 0 === this._score ? this._updateTutorialLabel("Does the meaning of this word match its font color?") : this._updateTutorialLabel("How about now?"));
        this.cards[0].swipe(this._score >= this._perfectGoal);
        var sprite = this.cards[0].valid ? this.answerSprites[1] : this.answerSprites[0];
        if (0 === sprite.node.getNumberOfRunningActions()) {
          sprite.spriteFrame = correct ? this.answerSpriteFrames[1] : this.answerSpriteFrames[0];
          var x = this.cards[0].valid ? cc.Canvas.instance.designResolution.width / 2 - (sprite.node.width / 2 + 20) : -cc.Canvas.instance.designResolution.width / 2 + (sprite.node.width / 2 + 20);
          sprite.node.x = x;
          sprite.node.active = true;
          sprite.node.opacity = 0;
          sprite.node.runAction(cc.sequence(cc.moveBy(.5, this.cards[0].valid ? -10 : 10, 0).easing(cc.easeSineInOut()), cc.callFunc(function() {
            sprite.node.active = false;
          }, this)));
          sprite.node.runAction(cc.fadeIn(.2).easing(cc.easeSineIn()));
          sprite.node.runAction(cc.sequence(cc.delayTime(.3), cc.fadeOut(.2).easing(cc.easeSineOut())));
        }
        if (this._score >= this._perfectGoal) {
          for (var i = 1; i < this.cards.length; i++) this.cards[i].node.active = false;
          this.extraCards[0].active = false;
          this.extraCards[1].active = false;
          this._endPuzzle();
        } else {
          var card = this.cards.shift();
          this.cards.push(card);
          this.cards[0].node.active = true;
        }
      },
      _gameOver: function _gameOver() {
        if (this._score >= this._passGoal) if (this._tutorialActive) {
          var delay = this.countdownCircle.wellDone();
          require("SaveManager").instance.tutorialActive = false;
          this.scheduleOnce(function() {
            this._reload();
          }, delay);
        } else {
          require("SaveManager").instance.setPlayerLevelData(this._level, this._score);
          this.winPopup.getComponent("WinPopup").init(this._score, this._passGoal, this._perfectGoal, this._level === require("SaveManager").instance.furthestLevel);
          this.winPopup.openPopup();
        } else {
          this.losePopup.getComponent("LosePopup").init(this._score, this._passGoal, this._perfectGoal);
          this.losePopup.openPopup();
        }
      },
      _quitGame: function _quitGame() {
        this._fsm.state = GameState.Exit;
        this.scheduleOnce(function() {
          cc.director.loadScene("start");
        }, .25);
      },
      _reload: function _reload() {
        this.settingsPopup.open && this.settingsPopup.closePopup();
        this.losePopup.open && this.losePopup.closePopup();
        this.winPopup.open && this.winPopup.closePopup();
        this._fsm.state = GameState.Exit;
        this.scheduleOnce(function() {
          cc.director.loadScene("game");
        }, .25);
      },
      _resetLevel: function _resetLevel() {
        this._tutorialActive = require("SaveManager").instance.tutorialActive || DEBUG_TUTORIALS;
        if (this._tutorialActive) {
          this._passGoal = 5;
          this._perfectGoal = 5;
        } else if (this._level > 0 && this._level < 31 && require("DataController").instance.tableExists("levels")) {
          var json = require("DataController").instance.getTable("levels");
          this._passGoal = json[this._level - 1].pass;
          this._perfectGoal = json[this._level - 1].perfect;
          this._timeLimit = json[this._level - 1].time;
        } else cc.log("USING DEFAULT GAME SCENE LEVEL VALUES!");
        this.scoreProgress.node.active = !this._tutorialActive;
        this.timeSprite.node.active = !this._tutorialActive;
        this.scoreProgress.goal = this._perfectGoal;
        this.scoreProgress.reset();
        this.timeSprite.node.width = 0;
        for (var i = 0; i < this.cards.length; i++) {
          this.cards[i].node.active = 0 === i;
          this.cards[i].tutorialMode = this._tutorialActive;
        }
        for (var i = 0; i < this.extraCards.length; i++) this.extraCards[i].active = true;
        this.cards[0].node.parent.y = -cc.Canvas.instance.designResolution.height;
        this._time = 0;
        this._score = 0;
        this._cardCount = this._perfectGoal;
      },
      _startPuzzle: function _startPuzzle() {
        this.resetLevel();
        this._fsm.state = GameState.Play;
      },
      _endPuzzle: function _endPuzzle() {
        this._hideTutorialLabel();
        this._fsm.state = GameState.Next;
      },
      _winPopupDidClose: function _winPopupDidClose() {
        if (this._level + 1 === require("SaveManager").instance.furthestLevel) this._dailyTrainingActive || this._reload(); else {
          this._fsm.state = GameState.Exit;
          this.scheduleOnce(function() {
            cc.director.loadScene("levelselect");
          }, .25);
        }
      },
      _losePopupDidClose: function _losePopupDidClose() {
        if (!this._dailyTrainingActive) {
          this._fsm.state = GameState.Exit;
          this.scheduleOnce(function() {
            cc.director.loadScene("levelselect");
          }, .25);
        }
      },
      _shakeCard: function _shakeCard() {
        var shakeSize = 6;
        var shakeTime = .033;
        var start = cc.p(this.cards[0].node.x, this.cards[0].node.y);
        var points = [ cc.p(2 * (Math.random() - .5) * shakeSize + start.x, 2 * (Math.random() - .5) * shakeSize + start.y), cc.p(2 * (Math.random() - .5) * shakeSize + start.x, 2 * (Math.random() - .5) * shakeSize + start.y), cc.p(2 * (Math.random() - .5) * shakeSize + start.x, 2 * (Math.random() - .5) * shakeSize + start.y), cc.p(2 * (Math.random() - .5) * shakeSize + start.x, 2 * (Math.random() - .5) * shakeSize + start.y) ];
        this.cards[0].node.runAction(cc.sequence(cc.moveTo(shakeTime, points[0]), cc.moveTo(shakeTime, points[1]), cc.moveTo(shakeTime, points[2]), cc.moveTo(shakeTime, start)));
      }
    });
    cc._RF.pop();
  }, {
    ColorCard: "ColorCard",
    CountdownCircle: "CountdownCircle",
    DataController: "DataController",
    FSM: "FSM",
    Popup: "Popup",
    SaveManager: "SaveManager",
    ScoreProgress: "ScoreProgress"
  } ]
}, {}, [ "ColorCard", "CountdownCircle", "KeyboardButtonSwitcher", "LevelNode", "LevelSelect", "Load", "SaveManager", "ScoreProgress", "Start", "WordColors", "AnalyticsController", "AudioManager", "ButtonAnimation", "DataController", "FSM", "IncrementLabelNumber", "LabelFontLoader", "Localization", "LocalizeLabel", "SettingsButton", "LosePopup", "Popup", "SettingsPopup", "WinPopup" ]);