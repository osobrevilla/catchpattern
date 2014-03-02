(function (win, doc, utils) {        

    function UIElement() {
        EventEmiter.call(this);
    };
    UIElement.prototype = Object.create(EventEmiter.prototype);
    UIElement.prototype.constructor = UIElement;

    /**
     *   DROP AREA
     */

    function DropArea(options) {
        UIElement.call(this);
        var p, events = ['dragenter', 'dragover', 'drop', 'dragleave'];
        this.el = utils.dom.create('div');
        this.el.classList.add('drop-area');
        this.options = {
            maxSize: 1024 * 2,
            mimes: ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'],
            limit: 1
        };

        this.areas = {};
        this.bgURL = null;
        this.bgImage = new Image();
        this.currentTailURL = null;
        for (p in options)
            this.options[p] = options[p];

        for (p in events)
            this.el.addEventListener(events[p], this, false);
        this.ctx = utils.dom.create('canvas').getContext('2d');
    };

    DropArea.prototype = Object.create(UIElement.prototype);
    DropArea.prototype.constructor = DropArea;
    DropArea.prototype.handleEvent = function (e) {
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

    DropArea.prototype._isFileValid = function (file) {
        return this.options.mimes.indexOf(file.type) > -1 && file.size / 1024 < this.options.maxSize;
    };

    DropArea.prototype._drop = function (e) {    
        var i, files = e.dataTransfer.files;
        [].forEach.call(files, function (file, i) {
            if (this._isFileValid(file))
                this.setBackground(file);
            return;
        }.bind(this));
    };

    DropArea.prototype.setBackground = function (file) {
        if (this.bgURL) {
            window.URL.revokeObjectURL(this.bgURL);
            this.bgURL = null;
        }
        this.bgURL = window.URL.createObjectURL(file);
        utils.dom.css(this.el, {
            background: 'url(' + this.bgURL + ') no-repeat'
        });
        this.bgImage.src = this.bgURL;
    };

    DropArea.prototype.getTail = function (point) {
        if (this.currentTailURL) {
            window.URL.revokeObjectURL(this.currentTailURL);
            this.currentTailURL = null;
        }
        this.ctx.canvas.width = point.w;
        this.ctx.canvas.height = point.h;
        this.ctx.drawImage(this.bgImage, point.x, point.y, point.w, point.h, 0, 0, point.w, point.h);
        return this.currentTailURL = window.URL.createObjectURL(utils.b64toBlob(this.ctx.canvas.toDataURL().split(',')[1], 'image/jpeg'));
    };

    DropArea.prototype.addArea = function (area) {
        if (this.options.limit && Object.keys(this.areas).length == this.options.limit) {
            area.destroy();
            return false;
        }
        area.ready();
        this.areas[area.id] = area;
        area.dropArea = this;
        this.el.appendChild(area.el);
        this.options.onAddArea && this.options.onAddArea.call(this, area);
        return true;
    };

    DropArea.prototype.removeArea = function (area) {
        var _area = this.areas[area.id];
        _area.destroy();
        delete this.areas[area.id];
    };


    /**
     *   CANVAS CLASS
     */

    function Canvas (el, options) {
        UIElement.call(this);
        var p;
        this.el = el;
        this.pointStart = {
            x: 0,
            y: 0
        };
        this.options = {};
        for (p in options)
            this.options[p] = options[p];
        this.pressed = false;
        this.tmpArea = null;
        this.el.addEventListener('mousedown', this, false);
    };

    Canvas.prototype = Object.create(UIElement.prototype);
    Canvas.prototype.constructor = Canvas;
    Canvas.prototype.handleEvent = function (e) {
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
    Canvas.prototype._mouseMove = function (e) {
        if (this.pressed) {
            var point = {
                w: e.pageX - this.el.offsetLeft - this.pointStart.x,
                h: e.pageY - this.el.offsetTop - this.pointStart.y,
                x: this.pointStart.x,
                y: this.pointStart.y
            };
            this.tmpArea.resize(point);
            this.fire('drawing', point);
        }
    };
    Canvas.prototype._mouseDown = function (e) {
        if (this.tmpArea) {
            this.tmpArea.destroy();
        }
        this.pressed = true;
        this.drawArea({
            x: e.pageX - this.el.offsetLeft,
            y: e.pageY - this.el.offsetTop
        });
        this.el.addEventListener('mouseup', this, false);
        this.el.addEventListener('mousemove', this, false);
    };

    Canvas.prototype._mouseUp = function (e) {
        this.pressed = false;
        if (this.tmpArea) {
            this.fire('drawend', this.tmpArea.point);
            this.tmpArea.destroy();
        }
        this.tmpArea = null;
        this.el.removeEventListener('mouseup', this, false);
        this.el.removeEventListener('mousemove', this, false);
    };

    Canvas.prototype.drawArea = function (point) {
        utils.extend(this.pointStart, point);
        this.tmpArea = new Rect(this.pointStart);
        this.el.appendChild(this.tmpArea.el);
    };
    




    /**
     *   PREVIEW BOX
     */

    function PreviewArea() {
        UIElement.call(this);
        this.el = utils.dom.create('div');
        this.el.classList.add('preview-area');
    };

    PreviewArea.prototype = Object.create(UIElement.prototype);
    PreviewArea.prototype.constructor = PreviewArea;
    PreviewArea.prototype.setPattern = function (url) {
        utils.dom.css(this.el, {
            background: 'url(' + url + ') left top repeat'
        });
    };





    /**
     *  AREA
     */

    function Figure (point, options) {
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
            height:0 
        };
        utils.dom.css(this.el, this._toCSS(this.point));
        this.el.addEventListener('mousedown', this, false);
    };

    Figure.prototype = Object.create(UIElement.prototype);
    Figure.prototype.constructor = Figure;

    Figure.prototype._toCSS = function (coords, units) {
        units = units || 'px';
        return {
            left: coords.x + units,
            top: coords.y + units,
            width: coords.w + units,
            height: coords.h + units
        };
    };

    Figure.prototype.destroy = function () {
        if (this.el.parentNode)
            this.el.parentNode.removeChild(this.el);
        this.el.removeEventListener('click', this, false);
        this.el = null;
    };


    Figure.prototype._createHandler = function (type) {
        var rh = new ResizeCorner(type, this);
        this.rHandlers.push(rh);
        this.el.appendChild(rh.el);
    };





    /**
     *  RECT AREA
     */

    function Rect (point, options) {
        var p;
        Figure.apply(this, arguments);
        this.point = utils.extend({}, point);
        this.el.style['-webkit-filter'] = 'invert(0.2)';
        this.el.style['-moz-filter'] = 'invert(0.2)';
        utils.dom.css(this.el, this._toCSS(this.point));
    };

    Rect.prototype = Object.create(Figure.prototype);
    Rect.prototype.constructor = Rect;
    Rect.prototype.handleEvent = function (e) {
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
                this._mouseMove(e);
                break;
            }
    };
    Rect.prototype._mouseDown = function (e) {
        this.startPoint = {
            x: e.offsetX == undefined? e.layerX : e.offsetX,
            y: e.offsetY == undefined? e.layerY : e.offsetY
        };
        this.el.parentNode.addEventListener('mousemove', this, false);
        this.el.parentNode.addEventListener('mouseup', this, false);
    };

    Rect.prototype._mouseMove = function (e) {
        this.point = utils.extend(this.point, {
            x: e.clientX - this.el.parentNode.offsetLeft - this.startPoint.x,
            y: e.clientY - this.el.parentNode.offsetTop - this.startPoint.y
        });
        utils.dom.css(this.el, this._toCSS(this.point));
        this.fire('move', this.point);
    };

    Rect.prototype._mouseUp = function (e) {
        this.startPoint = {
            x: 0,
            y: 0
        };
        this.el.parentNode.removeEventListener('mouseup', this, false);
        this.el.parentNode.removeEventListener('mousemove', this, false);
        this.fire('select');
    };


    Rect.prototype.ready = function () {
        this.el.classList.add('area-ready');
        this._createHandler('se');
    };

    Rect.prototype.size = function (point, units) {
        this.point = utils.extend(this.point, point);
        utils.dom.css(this.el, this._toCSS(this.point, units));
    };

    Rect.prototype.resize = function (point, units) {
        this.point = utils.extend(this.point, point);
        utils.dom.css(this.el, this._toCSS(this.point, units));
        this.fire('resize', this.point);
    };

    


    function ResizeCorner (type, figure) {
        UIElement.call(this);
        this.figure = figure;
        this.el = utils.dom.create('div');
        this.el.classList.add('rh');
        this.el.classList.add('rh-' + type);
        this.el.addEventListener('mousedown', this, false);
        this.oStartPos = {};
        this.area = null;
    }

    ResizeCorner.prototype = Object.create(UIElement.prototype);
    ResizeCorner.prototype.constructor = ResizeCorner;
    ResizeCorner.prototype.handleEvent = function (e) {
        switch (e.type) {
            case 'mousedown':
                e.stopPropagation();
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

    ResizeCorner.prototype._mouseDown = function (e) {
        this.oStartPos = {
            x: e.pageX,
            y: e.pageY,
        }
        this.figure.el.parentNode.addEventListener('mousemove', this, false);
        this.figure.el.parentNode.addEventListener('mouseup', this, false);
    };

    ResizeCorner.prototype._mouseMove = function (e) {
        
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

    ResizeCorner.prototype._mouseUp = function (e) {
      
        this.figure.el.parentNode.removeEventListener('mouseup', this, false);
        this.figure.el.parentNode.removeEventListener('mousemove', this, false);
        this.fire('select');
    };    

    ResizeCorner.SOUTH_EAST = 'se';
    


    doc.addEventListener('DOMContentLoaded', function () {
        
        var tid,
            canvas,
            previewArea,
            inputWidth,
            inputHeight,
            onChangeSize,
            btnDownload,
            coords,
            currentArea;
        
        function updateFigure() {
            var figure = this;
            clearTimeout(tid);
            tid = setTimeout(function () {
                var tail = dropArea.getTail(figure.point);
                previewArea.setPattern(tail);
                btnDownload.href = tail;
                btnDownload.download = "frag-" + (new Date()).getTime() + ".jpg";
                btnDownload.dataset.downloadurl = ['jpg', btnDownload.download, btnDownload.href].join(':');
            }, 100);
        }

        function updateCoords (point){
            coords.innerHTML = 'x:' + point.x + ' y: ' + point.y;
        }

        function onDrawing(e, point){
            inputWidth.value = point.w;
            inputHeight.value = point.h;
            updateCoords(point);
        }

        function selectArea(){ 
            currentArea = this;
            inputWidth.value = this.point.w;
            inputHeight.value = this.point.h;  
        }

        function onDragArea (e, point){
            updateCoords(point);   
            updateFigure.call(this);
        }

        function onResize(e, point){
            inputWidth.value = point.w;
            inputHeight.value = point.h;
            updateCoords(point);
            updateFigure.call(this);
        }

        function onDrawEnd(e, point) {
            var rect = new Rect(point, { hadlers: 'se' })
                    .on('move', onDragArea)
                    .on('select', selectArea)
                    .on('resize', onResize);
                
            dropArea.addArea(rect);
            currentArea = rect;
            inputWidth.value = point.w;
            inputHeight.value = point.h;
            updateFigure.call(rect);  
        }

        function onChangeSize() {
            if (currentArea) {
                currentArea.size({
                    w: parseInt(inputWidth.value, 10),
                    h: parseInt(inputHeight.value, 10)
                });
                updateFigure.call(currentArea);
            }
        }

        dropArea = new DropArea();
        
        canvas = new Canvas(dropArea.el)
                    .on('drawend', onDrawEnd)
                    .on('drawing', onDrawing);

        previewArea = new PreviewArea();

        inputWidth = utils.dom('input-width');
        inputHeight = utils.dom('input-height');
        coords = utils.dom('coords');
        btnDownload = utils.dom('download'); 
        inputWidth.addEventListener('change', onChangeSize, false);
        inputHeight.addEventListener('change', onChangeSize, false);

        //dropArea.addArea(area);
        doc.body.appendChild(dropArea.el);
        doc.body.appendChild(previewArea.el);
    });

}(window, window.document, app.utils));

document.addEventListener('mouseenter', function () {
    if ( chrome && chrome.app && chrome.app.window )
        chrome.app.window.current().focus(); 
});