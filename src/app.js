(function (doc, utils) {

    function CatchPattern(){
        
        this.tid = null;
        this.currentFigure = null;
        this.dom = {};
        this.dom.inputWidth = utils.dom('input-width');
        this.dom.inputHeight = utils.dom('input-height');
        this.dom.inputMoveBg = utils.dom('input-move-bg');
        this.dom.btnDownload = utils.dom('download');
        this.dom.coords = utils.dom('coords');

        this.dom.inputWidth.addEventListener('change', this.onChangeSize.bind(this), false);
        this.dom.inputHeight.addEventListener('change', this.onChangeSize.bind(this), false);
        this.dom.inputMoveBg.addEventListener('change', this.moveSourceImage.bind(this), false);

        this.uiCanvas = new UICanvas()
            .on('addfigure', this.onAddFigure.bind(this))
            .on('drawing', this.onDrawing.bind(this))
            .on('moving', function (e, point) {
                this.updateCoords(point);
            }.bind(this));

        this.dropArea = new UIDropArea(this.uiCanvas.el)
            .on('drop', this.onAddImage.bind(this));

        this.uiPreviewArea = new UIPreviewArea();
        this.uiSourceArea  = new UISourceArea();
        this.uiMouseScroller = new UIMouseScroller(this.uiSourceArea.el)
            .on('moving', function(){
                if (this.currentFigure)
                    this.updatePreview(this.currentFigure);
            }.bind(this))

        doc.body.appendChild(this.uiPreviewArea.el);
        doc.body.appendChild(this.uiSourceArea.el);
        doc.body.appendChild(this.uiCanvas.el);
    }


    CatchPattern.prototype = {

        constructor: CatchPattern,

        updatePreview: function(figure){
            clearTimeout(this.tid);
            this.tid = setTimeout(function () {
                var tail = this.uiSourceArea.getTail(utils.extend({}, figure.point));
                this.uiPreviewArea.setPattern(tail);
                this.dom.btnDownload.href = tail;
                this.dom.btnDownload.download = "frag-" + (new Date()).getTime() + "." + this.uiSourceArea.imgExt;
                this.dom.btnDownload.dataset.downloadurl = [
                    this.uiSourceArea.imgExt, 
                    this.dom.btnDownload.download, 
                    this.dom.btnDownload.href
                ].join(':');
            }.bind(this), 100);
        },

        updateCoords: function(point){
            this.dom.coords.innerHTML = 'x:' + point.x + ' y: ' + point.y;
        },

        updateSizes: function(point){
            this.dom.inputWidth.value = point.w;
            this.dom.inputHeight.value = point.h;
        },

        onAddImage: function(e, file){
            if (this.currentFigure)
                this.updateFigure(this.currentFigure);
            this.uiSourceArea.setSource(file);
            this.dropArea.showTitle(false);
            this.dom.inputMoveBg.disabled = false;
        },        

        onAddFigure: function(e, rect){
            var that = this;
             rect.on('move', this.onMoveFigure.bind(this))
                .on('resize', this.onResize.bind(this))
                .on('select', function () {
                    that.currentFigure = this;
                });
            this.currentFigure = rect;
            this.updateSizes(rect.point);
            this.updatePreview(rect);
            this.dom.inputWidth.disabled = false;
            this.dom.inputHeight.disabled = false;
        },

        onMoveFigure: function(e, point){
            this.updatePreview(e.target);
            this.updateCoords(point);
        },

        onDrawing: function(point){
            this.updateSizes(point);
        },

        onResize: function(e, point){
            this.updateSizes(point);
            this.updatePreview(e.target);
        },

        onChangeSize: function(){
            if (this.currentFigure) {
                this.currentFigure.size({
                    w: parseInt(this.dom.inputWidth.value, 10),
                    h: parseInt(this.dom.inputHeight.value, 10)
                });
                this.updatePreview(this.currentFigure);
            }
        },

        moveSourceImage: function(){
            if (this.dom.inputMoveBg.checked) {
                this.uiCanvas.disable();
                // this.dropArea.el.style.display = "none";
            } else {
                this.uiCanvas.enable();
                // this.dropArea.el.style.display = "block";
            }
            if (this.currentFigure)
                this.updatePreview(this.currentFigure);
        }
    };


    doc.addEventListener('DOMContentLoaded', function () {
        new CatchPattern();
    });


doc.addEventListener('mouseenter', function () {
    if (chrome && chrome.app && chrome.app.window)
        chrome.app.window.current().focus();
});

}(window.document, app.utils));
