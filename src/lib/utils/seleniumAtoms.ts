const getAttribute = "get-attribute.js";
const isDisplayed = "is-displayed.js";
const findElements = "find-elements.js";

import * as path from "path";
const SELENIUM_ATOMS_PATH = path.join(path.dirname(require.resolve("selenium-webdriver")), "lib", "atoms");

/**
 * @param {string} module
 * @return {!Function}
 */
function requireAtom(module: string) {
	try {
		return require(path.join(SELENIUM_ATOMS_PATH, module));
	} catch (ex) {
		throw Error(`Failed to import atoms module ${module} using Selenium path: ${SELENIUM_ATOMS_PATH}`);
	}
}

export = {
	requireIsDisplayed() {
		return requireAtom(isDisplayed);
	}
};
