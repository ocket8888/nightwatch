describe("Chrome DevTools Example", function() {

	it ("using CDP DOM Snapshot", async function(browser) {
		await browser.navigateTo("https://nightwatchjs.org");

		const dom = await browser.chrome.sendAndGetDevToolsCommand("DOMSnapshot.captureSnapshot", {
			computedStyles: []
		});

		browser.assert.deepStrictEqual(Object.keys(dom), ["documents", "strings"]);
	});
});
