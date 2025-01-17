const ProtocolAction = require("./_base-action.js");

/**
 * Sets the browser orientation.
 *
 * @param {string} orientation The new browser orientation: {LANDSCAPE|PORTRAIT}
 * @param {function} [callback] Optional callback function to be called when the command finishes.
 * @api protocol.mobile
 */
module.exports = class Session extends ProtocolAction {
	command(orientation, callback) {
		orientation = orientation.toUpperCase();

		if (!ProtocolAction.ScreenOrientation.includes(orientation)) {
			throw new Error("Invalid screen orientation value specified. Accepted values are: " + ProtocolAction.ScreenOrientation.join(", "));
		}

		return this.transportActions.setScreenOrientation(orientation, callback);
	}
};
