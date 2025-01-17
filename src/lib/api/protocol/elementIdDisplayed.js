const ProtocolAction = require("./_base-action.js");

/**
 * Determine if an element is currently displayed.
 *
 * @link /#element-displayedness
 * @param {string} webElementId The [Web Element ID](https://www.w3.org/TR/webdriver1/#dfn-web-elements) of the element to route the command to.
 * @param {function} callback Callback function which is called with the result value.
 * @api protocol.elementinternal
 * @internal
 */
module.exports = class Session extends ProtocolAction {
	async command(webElementId, callback) {
		ProtocolAction.validateElementId(webElementId, "elementIdDisplayed");

		return this.transportActions.isElementDisplayed(webElementId, callback);
	}
};
