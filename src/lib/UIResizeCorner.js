/**
 *   UIResizeCorner
 *   Require: EventEmiter.js
 */

UIResizeCorner = (function (utils) {

    function UIResizeCorner(type, figure) {
        UIElement.call(this);
        this.figure = figure;
        this.el = utils.dom.create('div');
        this.el.classList.add('rh');
        this.el.classList.add('rh-' + type);
        this.el.addEventListener('mousedown', this, false);
        this.oStartPos = {};
        this.area = null;
    }

    UIResizeCorner.prototype = Object.create(UIElement.prototype);
    UIResizeCorner.prototype.constructor = UIResizeCorner;
    UIResizeCorner.prototype.handleEvent = function (e) {
        switch (e.type) {
        case 'mousedown':
            e.stopPropagation();
            e.preventDefault();
            if (e.button > 0)
                return;
            this._mouseDown(e);
            this.el.classList.add('rh-move');
            break;
        case 'mouseup':
            this._mouseUp(e);
            this.el.classList.remove('rh-move');
            break;
        case 'mousemove':
            this._mouseMove(e);
            break;
        }
    };

    UIResizeCorner.prototype._mouseDown = function (e) {
        this.oStartPos = {
            x: e.pageX,
            y: e.pageY
        };
        this.figure.el.parentNode.addEventListener('mousemove', this, false);
        this.figure.el.parentNode.addEventListener('mouseup', this, false);
    };

    UIResizeCorner.prototype._mouseMove = function (e) {
        var moved = {
            x: (e.pageX - this.oStartPos.x) || 0,
            y: (e.pageY - this.oStartPos.y) || 0
        };
        this.oStartPos.x = e.pageX;
        this.oStartPos.y = e.pageY;

        this.figure.resize({
            w: this.figure.point.w + moved.x,
            h: this.figure.point.h + moved.y
        });
    };

    UIResizeCorner.prototype._mouseUp = function (e) {
        this.figure.el.parentNode.removeEventListener('mouseup', this, false);
        this.figure.el.parentNode.removeEventListener('mousemove', this, false);
    };

    UIResizeCorner.SOUTH_EAST = 'se';

    return UIResizeCorner;
    
}(app.utils));