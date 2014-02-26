app = window.app || {};

(function(win, doc){

	this.dom = (function () {

        var dom = function (id) {
            return doc.getElementById(id);
        };

        dom.create = function (tagName, t) {
            return doc['create' + (t ? 'TextNode' : 'Element')](tagName);
        };

        dom.query = function (str) {
            return doc.querySelectorAll(str);
        };

        dom.css = function (target, styles) {
            var p;
            for (p in styles)
                target.style[p] = styles[p];
        };
        return dom;
    }());

	
	this.extend = function (target, source) {
        var p;
        for (p in source)
            target[p] = source[p];
        return target;
    };

	this.copyToClipboard = function (text) {
	    var area = dom.create('textarea');
	    area.value = text;
	    doc.body.appendChild(area);
	    area.unselectable = "off";
	    area.focus();
	    area.select();
	    doc.execCommand("Copy");
	    doc.body.removeChild(area);
	};

    this.b64toBlob = function (b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    };

}.call(app.utils = {}, window, window.document));