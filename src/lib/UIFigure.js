/**
 *   UIFigure
 *   Require: UIElement.js
 */

UIFigure = (function (utils) {

    function UIFigure(point, options) {
        var p;
        UIElement.call(this);
        this.options = {
            hadlers: 'all'
        };
        for (p in options)
            this.options[p] = options[p];
        this.point = utils.extend({}, point);
        this.el = utils.dom.create('div');
        this.el.classList.add('area');
        this.id = 'area-id-' + (new Date()).getTime();
        this.rHandlers = [];
        this.point = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        utils.dom.css(this.el, this._toCSS(this.point));
        this.el.addEventListener('mousedown', this, false);
    };

    UIFigure.prototype = Object.create(UIElement.prototype);
    UIFigure.prototype.constructor = UIFigure;

    UIFigure.prototype._toCSS = function (coords, units) {
        units = units || 'px';
        return {
            left: coords.x + units,
            top: coords.y + units,
            width: coords.w + units,
            height: coords.h + units
        };
    };

    UIFigure.prototype.destroy = function () {
        if (this.el.parentNode)
            this.el.parentNode.removeChild(this.el);
        this.el.removeEventListener('click', this, false);
        this.el = null;
    };

    UIFigure.prototype._createHandler = function (type) {
        var rh = new UIResizeCorner(type, this);
        this.rHandlers.push(rh);
        this.el.appendChild(rh.el);
    };

    return UIFigure;

}(app.utils));
