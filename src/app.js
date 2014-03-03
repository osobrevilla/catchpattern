(function (win, doc, utils) {    



    /**
     *   BASIC ELEMENT
     */


    function UIElement() {
        EventEmiter.call(this);
    };
    UIElement.prototype = Object.create(EventEmiter.prototype);
    UIElement.prototype.constructor = UIElement;





    /**
     *   DROPBOX
     */

    function SourceArea(el, options) {
        UIElement.call(this);
        this.el = el || utils.dom.create('div');
        this.el.classList.add('source-area');
        this.ctx = utils.dom.create('canvas').getContext('2d');
        this.bgURL = null;
        this.bgImage = new Image();
        this.currentTailURL = null;
        this.hasBackground = false;
    };

    SourceArea.prototype = Object.create(UIElement.prototype);
    SourceArea.prototype.constructor = SourceArea;
    SourceArea.prototype.setSource = function (file) {
        if (this.bgURL) {
            window.URL.revokeObjectURL(this.bgURL);
            this.bgURL = null;
        }
        this.bgURL = window.URL.createObjectURL(file);
        this.el.appendChild(this.bgImage);
        this.bgImage.src = this.bgURL;
    };
    SourceArea.prototype.getTail = function (point) {
        point.x += this.el.scrollLeft;
        point.y += this.el.scrollTop;
        if (this.currentTailURL) {
            window.URL.revokeObjectURL(this.currentTailURL);
            this.currentTailURL = null;
        }
        this.ctx.canvas.width = point.w;
        this.ctx.canvas.height = point.h;
        this.ctx.drawImage(this.bgImage, point.x, point.y, point.w, point.h, 0, 0, point.w, point.h);
        return this.currentTailURL = window.URL.createObjectURL(utils.b64toBlob(this.ctx.canvas.toDataURL().split(',')[1], 'image/jpeg'));
    };





    /**
     *   DROP AREA
     */

    function DropArea(el, options) {
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
                this.fire('drop', file);
            return;
        }.bind(this));
    };

    DropArea.prototype.showTitle = function(v){
        this.el.style.background = v ? '':'none';
    };



   





    /**
     *   CANVAS CLASS
     */

    function Canvas (el, options) {
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

    Canvas.prototype = Object.create(UIElement.prototype);
    Canvas.prototype.constructor = Canvas;
    Canvas.prototype.disable = function(){
        if (this.enabled === true ){
            this.el.removeEventListener('mousedown', this, false);
            this.el.classList.remove('canvas-area');
        }
        this.enabled = false;
    };

    Canvas.prototype.enable = function(){
        if (this.enabled === false){
            this.el.addEventListener('mousedown', this, false);
            this.el.classList.add('canvas-area');
        }
        this.enabled = true;
    };
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
    Canvas.prototype._mouseDown = function (e) {
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

    Canvas.prototype._mouseUp = function (e) {
        this.pressed = false;
        if (this.tmpFig) {
            this.addFigure(this.tmpFig);
            this.fire('drawend', this.tmpFig);
        }
        this.tmpFig = null;
        this.el.removeEventListener('mouseup', this, false);
    };

    Canvas.prototype.drawArea = function (point) {
        utils.extend(this.pointStart, point);
        this.tmpFig = new Rect(this.pointStart);
        this.el.appendChild(this.tmpFig.el);
    };
    
    Canvas.prototype.addFigure = function (figure) {
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

    Canvas.prototype.removeFigure = function (figure) {
        this.figures[figure.id].destroy();
        delete this.figures[figure.id];
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
                e.stopPropagation();
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
            x: e.clientX - this.el.parentNode.offsetLeft - this.startPoint.x + this.canvas.el.scrollLeft,
            y: e.clientY - this.el.parentNode.offsetTop - this.startPoint.y + this.canvas.el.scrollTop
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

    


    /**
     *  RESIZE CORNER
     */

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

    ResizeCorner.prototype._mouseDown = function (e) {
        this.oStartPos = {x: e.pageX, y: e.pageY };
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
    };    

    ResizeCorner.SOUTH_EAST = 'se';

    doc.addEventListener('DOMContentLoaded', function () {
        
        var tid,
            canvas,
            previewArea,
            sourceArea,
            inputWidth,
            inputHeight,
            onChangeSize,
            btnDownload,
            coords,
            currentFig,
            inputMoveBg;
        
        function updateFigure(figure) {
            clearTimeout(tid);
            tid = setTimeout(function () {
                var tail = sourceArea.getTail(utils.extend({}, figure.point));
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
        }

        function updateSizes(point){
            inputWidth.value = point.w;
            inputHeight.value = point.h;  
        }

        function onMoveFigure(){  
            updateFigure(this);
            updateCoords(this.point);
        }

        function onResize(e, point){
            inputWidth.value = point.w;
            inputHeight.value = point.h;
            updateFigure(this);
        }

        function addFigure(e, rect) {
            rect.on('move', onMoveFigure)
                .on('resize', onResize)
                .on('select', function(){
                    currentFig = this;
                });
            currentFig = rect;
            updateSizes(rect.point);
            updateFigure(rect);  
        }

        function onChangeSize() {
            if (currentFig) {
                currentFig.size({
                    w: parseInt(inputWidth.value, 10),
                    h: parseInt(inputHeight.value, 10)
                });
                updateFigure(currentFig);
            }
        }

        function moveBg() {
          var move = this.checked;
            if (move) {
                canvas.disable();
                dropArea.el.style.display = "none";
            } else {
                canvas.enable();
                dropArea.el.style.display = "block";
            }
        }

        canvas = new Canvas()
                    .on('addfigure', addFigure)
                    .on('drawing', onDrawing)
                    .on('moving', function(e,point){
                        updateCoords(point);
                    });

        dropArea = new DropArea(canvas.el)
                    .on('drop', function(e, file){
                        if (currentFig)
                            updateFigure(currentFig);
                        sourceArea.setSource(file);
                        dropArea.showTitle(false);
                        inputMoveBg.removeAttribute('disabled');
                    });

        previewArea = new PreviewArea();
        sourceArea = new SourceArea();
        inputWidth = utils.dom('input-width');
        inputHeight = utils.dom('input-height');
        inputMoveBg = utils.dom('input-move-bg');
        coords = utils.dom('coords');
        btnDownload = utils.dom('download'); 
        inputWidth.addEventListener('change', onChangeSize, false);
        inputHeight.addEventListener('change', onChangeSize, false);
        inputMoveBg.addEventListener('change', moveBg, false);

        //dropArea.addArea(area);
        
        doc.body.appendChild(previewArea.el);
        doc.body.appendChild(sourceArea.el);
        doc.body.appendChild(canvas.el);
    });

}(window, window.document, app.utils));

document.addEventListener('mouseenter', function () {
    if ( chrome && chrome.app && chrome.app.window )
        chrome.app.window.current().focus(); 
});