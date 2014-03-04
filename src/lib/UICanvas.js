/**
 *   UICanvas
 *   Require: UIElement.js
 */

UICanvas = (function (utils) {

    function UICanvas(el, options) {
        UIElement.call(this);
        var p;
        this.el = el || utils.dom.create('div');
        this.el.classList.add('canvas-area');
        this.figures = {};
        this.pointStart = {
            x: 0,
            y: 0
        };
        this.options = {
            limit: 1
        };
        for (p in options)
            this.options[p] = options[p];
        this.pressed = false;
        this.tmpArea = null;
        this.el.addEventListener('mousedown', this, false);
        this.el.addEventListener('mousemove', this, false);
        this.enabled = true;
    };

    UICanvas.prototype = Object.create(UIElement.prototype);
    UICanvas.prototype.constructor = UICanvas;
    UICanvas.prototype.disable = function () {
        if (this.enabled === true) {
            this.el.removeEventListener('mousedown', this, false);
            this.el.classList.remove('canvas-area');
        }
        this.enabled = false;
    };

    UICanvas.prototype.enable = function () {
        if (this.enabled === false) {
            this.el.addEventListener('mousedown', this, false);
            this.el.classList.add('canvas-area');
        }
        this.enabled = true;
    };
    UICanvas.prototype.handleEvent = function (e) {
        switch (e.type) {
        case 'mousedown':
            this._mouseDown(e);
            break;
        case 'mouseup':
            this._mouseUp(e);
            break;
        case 'mousemove':
            this._mouseMove(e);
            break;
        }
    };

    UICanvas.prototype._mouseMove = function (e) {
        if (this.pressed) {
            var point = {
                w: e.pageX - this.el.offsetLeft - this.pointStart.x + this.el.scrollLeft,
                h: e.pageY - this.el.offsetTop - this.pointStart.y + this.el.scrollTop,
                x: this.pointStart.x,
                y: this.pointStart.y
            };
            this.tmpFig.resize(point);
            this.fire('drawing', point);
        } else {
            this.fire('moving', {
                x: e.pageX,
                y: e.pageY
            });
        }
    };
    UICanvas.prototype._mouseDown = function (e) {
        if (this.tmpFig) {
            this.tmpFig.destroy();
        }
        this.pressed = true;
        this.drawArea({
            x: e.pageX - this.el.offsetLeft + this.el.scrollLeft,
            y: e.pageY - this.el.offsetTop + this.el.scrollTop
        });
        this.el.addEventListener('mouseup', this, false);
        this.el.addEventListener('mousemove', this, false);
    };

    UICanvas.prototype._mouseUp = function (e) {
        this.pressed = false;
        if (this.tmpFig) {
            this.addFigure(this.tmpFig);
            this.fire('drawend', this.tmpFig);
        }
        this.tmpFig = null;
        this.el.removeEventListener('mouseup', this, false);
    };

    UICanvas.prototype.drawArea = function (point) {
        utils.extend(this.pointStart, point);
        this.tmpFig = new UIFigureRect(this.pointStart);
        this.el.appendChild(this.tmpFig.el);
    };

    UICanvas.prototype.addFigure = function (figure) {
        if (this.options.limit && Object.keys(this.figures).length >= this.options.limit) {
            figure.destroy();
            return false;
        }
        figure.ready();
        this.figures[figure.id] = figure;
        figure.canvas = this;
        this.el.appendChild(figure.el);
        this.fire('addfigure', figure);
        return true;
    };

    UICanvas.prototype.removeFigure = function (figure) {
        this.figures[figure.id].destroy();
        delete this.figures[figure.id];
    };

    return UICanvas;

}(app.utils));