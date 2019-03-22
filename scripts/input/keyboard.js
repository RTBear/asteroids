MyGame.input.Keyboard = function () {
    let that = {
        keys: {},
        handlers: {}
    };

    function keyPress(e) {
        if (that.keys[e.key] != 'expired') {
            that.keys[e.key] = e.timeStamp;
        }
    }

    function keyRelease(e) {
        delete that.keys[e.key];
    }

    that.update = function (elapsedTime) {
        for (let key in that.keys) {
            if (that.keys.hasOwnProperty(key)) {
                if (that.keys[key] != 'expired') {//uncomment to act only once per key press
                    if (that.handlers[key]) {
                        that.handlers[key].handler(elapsedTime);
                        if(!that.handlers[key].canHold){
                            that.keys[key] = 'expired';//if key is not 'holdable'
                        }
                    }
                }
            }
        }
    };

    that.register = function (key, handler, canHold=true) {
        that.handlers[key] = {
            handler: handler,
            canHold: canHold,
        };
    };

    window.addEventListener('keydown', keyPress);
    window.addEventListener('keyup', keyRelease);

    return that;
};