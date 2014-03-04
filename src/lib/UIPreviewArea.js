/**
 *   UIPreviewArea 
 *   Require: UIElement.js
 */

UIPreviewArea = (function (utils) {

	function UIPreviewArea() {
	    UIElement.call(this);
	    this.el = utils.dom.create('div');
	    this.el.classList.add('preview-area');
	};

	UIPreviewArea.prototype = Object.create(UIElement.prototype);
	UIPreviewArea.prototype.constructor = UIPreviewArea;
	UIPreviewArea.prototype.setPattern = function (url) {
	    utils.dom.css(this.el, {
	        background: 'url(' + url + ') left top repeat'
	    });
	};

	return UIPreviewArea;

}(app.utils));