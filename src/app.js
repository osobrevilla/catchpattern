(function (doc, utils) {


    doc.addEventListener('DOMContentLoaded', function () {

        var tid,
            uiCanvas,
            uiPreviewArea,
            uiSourceArea,
            uiMouseScroller,
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
                var tail = uiSourceArea.getTail(utils.extend({}, figure.point));
                uiPreviewArea.setPattern(tail);
                btnDownload.href = tail;
                btnDownload.download = "frag-" + (new Date()).getTime() + "." + uiSourceArea.imgExt;
                btnDownload.dataset.downloadurl = [uiSourceArea.imgExt, btnDownload.download, btnDownload.href].join(':');
            }, 100);
        }

        function updateCoords(point) {
            coords.innerHTML = 'x:' + point.x + ' y: ' + point.y;
        }

        function onDrawing(e, point) {
            inputWidth.value = point.w;
            inputHeight.value = point.h;
        }

        function updateSizes(point) {
            inputWidth.value = point.w;
            inputHeight.value = point.h;
        }

        function onMoveFigure() {
            updateFigure(this);
            updateCoords(this.point);
        }

        function onResize(e, point) {
            inputWidth.value = point.w;
            inputHeight.value = point.h;
            updateFigure(this);
        }

        function addFigure(e, rect) {
            rect.on('move', onMoveFigure)
                .on('resize', onResize)
                .on('select', function () {
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
                uiCanvas.disable();
                dropArea.el.style.display = "none";
            } else {
                uiCanvas.enable();
                dropArea.el.style.display = "block";
            }
        }

        uiCanvas = new UICanvas()
            .on('addfigure', addFigure)
            .on('drawing', onDrawing)
            .on('moving', function (e, point) {
                updateCoords(point);
            });

        dropArea = new UIDropArea(uiCanvas.el)
            .on('drop', function (e, file) {
                if (currentFig)
                    updateFigure(currentFig);
                uiSourceArea.setSource(file);
                dropArea.showTitle(false);
                inputMoveBg.removeAttribute('disabled');
            });

        uiPreviewArea = new UIPreviewArea();
        uiSourceArea = new UISourceArea();
        uiMouseScroller = new UIMouseScroller(uiSourceArea.el);

        inputWidth = utils.dom('input-width');
        inputHeight = utils.dom('input-height');
        inputMoveBg = utils.dom('input-move-bg');
        coords = utils.dom('coords');
        btnDownload = utils.dom('download');
        inputWidth.addEventListener('change', onChangeSize, false);
        inputHeight.addEventListener('change', onChangeSize, false);
        inputMoveBg.addEventListener('change', moveBg, false);

        doc.body.appendChild(uiPreviewArea.el);
        doc.body.appendChild(uiSourceArea.el);
        doc.body.appendChild(uiCanvas.el);

    });




doc.addEventListener('mouseenter', function () {
    if (chrome && chrome.app && chrome.app.window)
        chrome.app.window.current().focus();
});

}(window.document, app.utils));
