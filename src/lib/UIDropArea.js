/**
 *   UIDropArea
 *   Require: UIElement.js
 */

UIDropArea = (function (utils) {


    function UIDropArea(el, options) {
        UIElement.call(this);
        var p, events = ['dragenter', 'dragover', 'drop', 'dragleave'];
        this.el = el || utils.dom.create('div');
        this.el.classList.add('drop-area');
        this.options = {
            maxSize: 1024 * 2,
            mimes: ['image/jpeg', 'image/jpg', 'image/gif', 'image/png']
        };

        for (p in options)
            this.options[p] = options[p];
        for (p in events)
            this.el.addEventListener(events[p], this, false);
    };

    UIDropArea.prototype = Object.create(UIElement.prototype);
    UIDropArea.prototype.constructor = UIDropArea;
    UIDropArea.prototype.handleEvent = function (e) {
        switch (e.type) {
        case 'dragenter':
            this.el.classList.add('droparea-over');
            break;
        case 'dragover':
            e.preventDefault();
            break;
        case 'dragleave':
            this.el.classList.remove('droparea-over');
            break;
        case 'drop':
            e.stopPropagation(); // Stops some browsers from redirecting.
            e.preventDefault();
            this.el.classList.remove('droparea-over');
            this._drop(e);
            break;
        }
    };

    UIDropArea.prototype._isFileValid = function (file) {
        return this.options.mimes.indexOf(file.type) > -1 && file.size / 1024 < this.options.maxSize;
    };

    UIDropArea.prototype._drop = function (e) {
        var i, files = e.dataTransfer.files;
        [].forEach.call(files, function (file, i) {
            if (this._isFileValid(file))
                this.fire('drop', file);
            return;
        }.bind(this));
    };

    UIDropArea.prototype.showTitle = function (v) {
        this.el.style.background = v ? '' : 'none';
    };

    return UIDropArea;

}(app.utils));