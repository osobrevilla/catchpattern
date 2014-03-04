/**
*   UIFigureRect
*   Require: UIFigure.js
*/

UIFigureRect = (function (utils) {


    function UIFigureRect(point, options) {
        var p;
        UIFigure.apply(this, arguments);
        this.point = utils.extend({}, point);
        this.el.style['-webkit-filter'] = 'invert(0.2)';
        this.el.style['-moz-filter'] = 'invert(0.2)';
        utils.dom.css(this.el, this._toCSS(this.point));
    };

    UIFigureRect.prototype = Object.create(UIFigure.prototype);
    UIFigureRect.prototype.constructor = UIFigureRect;
    UIFigureRect.prototype.handleEvent = function (e) {
        switch (e.type) {
        case 'mousedown':
            e.preventDefault();
            e.stopPropagation();
            if (e.button > 0)
                return;
            this._mouseDown(e);
            this.el.classList.add('area-move');
            break;
        case 'mouseup':
            this._mouseUp(e);
            this.el.classList.remove('area-move');
            break;
        case 'mousemove':
            e.stopPropagation();
            this._mouseMove(e);
            break;
        }
    };
    UIFigureRect.prototype._mouseDown = function (e) {
        this.startPoint = {
            x: e.offsetX == undefined ? e.layerX : e.offsetX,
            y: e.offsetY == undefined ? e.layerY : e.offsetY
        };
        this.el.parentNode.addEventListener('mousemove', this, false);
        this.el.parentNode.addEventListener('mouseup', this, false);
    };

    UIFigureRect.prototype._mouseMove = function (e) {
        this.point = utils.extend(this.point, {
            x: e.clientX - this.el.parentNode.offsetLeft - this.startPoint.x + this.canvas.el.scrollLeft,
            y: e.clientY - this.el.parentNode.offsetTop - this.startPoint.y + this.canvas.el.scrollTop
        });
        utils.dom.css(this.el, this._toCSS(this.point));
        this.fire('move', this.point);
    };

    UIFigureRect.prototype._mouseUp = function (e) {
        this.startPoint = {
            x: 0,
            y: 0
        };
        this.el.parentNode.removeEventListener('mouseup', this, false);
        this.el.parentNode.removeEventListener('mousemove', this, false);
        this.fire('select');
    };

    UIFigureRect.prototype.ready = function () {
        this.el.classList.add('area-ready');
        this._createHandler('se');
    };

    UIFigureRect.prototype.size = function (point, units) {
        this.point = utils.extend(this.point, point);
        utils.dom.css(this.el, this._toCSS(this.point, units));
    };

    UIFigureRect.prototype.resize = function (point, units) {
        this.point = utils.extend(this.point, point);
        utils.dom.css(this.el, this._toCSS(this.point, units));
        this.fire('resize', this.point);
    };

    return UIFigureRect;

}(app.utils));