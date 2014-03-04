/**
 *   UIElement
 *   Require: EventEmiter.js
 */

function UIElement() {
    EventEmiter.call(this);
};
UIElement.prototype = Object.create(EventEmiter.prototype);
UIElement.prototype.constructor = UIElement;