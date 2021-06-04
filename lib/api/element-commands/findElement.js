const BaseElementCommand = require('./_baseElementCommand.js');

/**
 * Search for an element on the page, starting from the document root. The located element will be returned as a web element JSON object.
 * First argument to be passed is the locator strategy, which is detailed on the [WebDriver docs](https://www.w3.org/TR/webdriver/#locator-strategies).
 *
 * The locator strategy can be one of:
 * - `css selector`
 * - `link text`
 * - `partial link text`
 * - `tag name`
 * - `xpath`
 *
 * @example
 * module.exports = {
 *  'demo Test' : function(browser) {
 *     browser.element('css selector', 'body', function(result) {
 *       console.log(result.value)
 *     });
 *   },
 *
 *   'es6 async demo Test': async function(browser) {
 *     const result = await browser.element('css selector', 'body');
 *     console.log('result value is:', result.value);
 *   }
 * }
 *
 * // Example with using page object elements
 * module.exports = {
 *  'demo Test with page object' : function(browser) {
 *     const loginPage = browser.page.login();
 *     loginPage.api.element('@resultContainer', function(result) {
 *       console.log(result.value)
 *     });
 *   }
 * }
 *
 *
 * @link /#find-element
 * @syntax .findElement(using, value, callback)
 * @editline L680
 * @param {string} using The locator strategy to use.
 * @param {string} value The search target.
 * @param {function} callback Callback function which is called with the result value.
 * @api protocol.elements
 */
const FindElements = require('./findElements.js');

module.exports = class FindElement extends FindElements {
  async elementFound(response) {
    if (response && response.value) {
      const elementId = this.transport.getElementId(response.value);

      response.value = Object.assign(response.value, {
        get getId() {
          return function() {
            return elementId;
          };
        }
      });
    }

    return response;
  }

  findElementAction() {
    return this.findElement();
  }
};