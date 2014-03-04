/**
 *   UISourceArea
 *   Require: UIElement.js
 */


UISourceArea = (function (utils) {

    function UISourceArea(el, options) {
        UIElement.call(this);
        this.el = el || utils.dom.create('div');
        this.el.classList.add('source-area');
        this.ctx = utils.dom.create('canvas').getContext('2d');
        this.bgURL = null;
        this.bgImage = new Image();
        this.currentTailURL = null;
        this.hasBackground = false;
        this.imgType = null;
        this.imgName = null;
    };

    UISourceArea.prototype = Object.create(UIElement.prototype);
    UISourceArea.prototype.constructor = UISourceArea;
    UISourceArea.prototype.setSource = function (file) {
        if (this.bgURL) {
            window.URL.revokeObjectURL(this.bgURL);
            this.bgURL = null;
        }
        this.bgURL = window.URL.createObjectURL(file);
        this.el.appendChild(this.bgImage);
        this.imgType = file.type;
        this.imgName = file.name;
        this.imgExt = file.name.match(/\.([^.]+)$/)[1];
        this.bgImage.src = this.bgURL;
    };

    UISourceArea.prototype.getTail = function (point) {
        point.x += this.el.scrollLeft;
        point.y += this.el.scrollTop;
        if (this.currentTailURL) {
            window.URL.revokeObjectURL(this.currentTailURL);
            this.currentTailURL = null;
        }
        this.ctx.canvas.width = point.w;
        this.ctx.canvas.height = point.h;
        this.ctx.drawImage(this.bgImage, point.x, point.y, point.w, point.h, 0, 0, point.w, point.h);
        return this.currentTailURL = window.URL.createObjectURL(utils.b64toBlob(this.ctx.canvas.toDataURL().split(',')[1], this.imgType || 'image/jpeg'));
    };

    return UISourceArea;

}(app.utils));