EventEmiter = (function () {

    EventEmiter = function () {
        this._listeners = {};
    };

    EventEmiter.prototype.on = function (type, listener) {
        if (typeof this._listeners[type] == "undefined")
            this._listeners[type] = [];
        this._listeners[type].push(listener);
        return this;
    };
    EventEmiter.prototype.off = function (type, listener) {
        if (this._listeners[type] instanceof Array) {
            var listeners = this._listeners[type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
        return this;
    };
    EventEmiter.prototype.fire = function (event, args) {

        if (typeof event == "string")
            event = {
                type: event
            };

        if (!event.target)
            event.target = this;

        if (!event.type) //falsy
            throw new Error("Event object missing 'type' property.");

        if (this._listeners[event.type] instanceof Array) {
            var listeners = this._listeners[event.type];
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].apply(this, [event].concat(args));
            }
        }
        return this;
    };
    
    return EventEmiter;
}())