/**
 *   UIMouseScroller
 *   Require: UIElement.js
 */

UIMouseScroller = (function (utils) {

    function UIMouseScroller(el, options) {
        UIElement.call(this);
        this.el = el || utils.dom.create('div');
        this.el.classList.add('mousescroll');
        this.currentPos = {
            x: this.el.scrollLeft,
            y: this.el.scrollTop
        };
        this.startPosition = {
            x: 0,
            y: 0
        };
        this.el.addEventListener('mousedown', this, false);
        this.enabled = true;
    }
    UIMouseScroller.prototype = Object.create(UIElement.prototype);
    UIMouseScroller.prototype.constructor = UIMouseScroller;

    UIMouseScroller.prototype.disable = function () {
        if (this.enabled === true)
            this.el.removeEventListener('mousedown', this, false);
        this.enabled = false;
    };

    UIMouseScroller.prototype.enable = function () {
        if (this.enabled === false)
            this.el.addEventListener('mousedown', this, false);
        this.enabled = true;
    };

    UIMouseScroller.prototype.handleEvent = function (e) {
        switch (e.type) {
        case 'mousedown':
            e.preventDefault();
            e.stopPropagation();
            if (e.button > 0)
                return;
            this._mouseDown(e);
            this.el.classList.add('mousescroll-move');
            break;
        case 'mouseup':
            this._mouseUp(e);
            this.el.classList.remove('mousescroll-move');
            break;
        case 'mousemove':
            e.stopPropagation();
            this._mouseMove(e);
            break;
        }
    };
    UIMouseScroller.prototype._mouseDown = function (e) {
        this.startPosition = {
            x: e.pageX + this.el.scrollLeft,
            y: e.pageY + this.el.scrollTop
        };
        this.el.parentNode.addEventListener('mousemove', this, false);
        this.el.parentNode.addEventListener('mouseup', this, false);
    };

    UIMouseScroller.prototype._mouseMove = function (e) {
        var move = {
            x: this.startPosition.x - e.pageX,
            y: this.startPosition.y - e.pageY
        };
        this.el.scrollLeft = move.x;
        this.el.scrollTop = move.y;
        this.fire('moving', utils.extend({}, move));
    };

    UIMouseScroller.prototype._mouseUp = function (e) {
        this.el.parentNode.removeEventListener('mouseup', this, false);
        this.el.parentNode.removeEventListener('mousemove', this, false);
    };

 return UIMouseScroller;

}(app.utils));