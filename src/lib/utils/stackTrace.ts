import boxen from "boxen";

import Colors from "./colors";
import isErrorObject from "./isErrorObject";
import addDetailedError from "./addDetailedError";

const {colors} = Colors;
const indentRegex = /^/gm;

function contains(str: string, text: string | Array<string>): boolean {
	if (Array.isArray(text)) {
		for (const item of text) {
			if (contains(str, item)) {
				return true;
			}
		}
		return false;
	}

	return str.includes(text);
};

function stackTraceFilter(parts: Array<string>): string {
	const stack = parts.reduce((list, line) => {
		if (contains(line, [
			"node_modules",
			"(node.js:",
			"(timers.js:",
			"(events.js:",
			"(util.js:",
			"(net.js:",
			"(internal/process/",
			"internal/modules/cjs/loader.js",
			"internal/modules/cjs/helpers.js",
			"internal/timers.js",
			"_http_client.js:",
			"process._tickCallback",
			"node:internal/"
		])) {
			return list;
		}

		list.push(line);

		return list;
	}, new Array<string>());

	return stack.join("\n");
};

function filterStack(err: unknown): string {
	if (err instanceof Error) {
		if (!err.stack) {
			// consistent with old behavior
			throw new TypeError("err.stack is undefined");
		}
		const stackTrace = err.stack.split("\n").slice(1);

		return stackTraceFilter(stackTrace);
	}

	return "";
};

function filterStackTrace(stackTrace: string = ""): string {
	const sections = stackTrace.split("\n");

	return stackTraceFilter(sections);
};

function showStackTrace(stack: string) {
	const parts = stack.split("\n");
	const headline = parts.shift();

	// preserves old behavior
	if (headline === undefined) {
		throw new TypeError("headline is undefined");
	}

	console.error(colors.red(headline.replace(indentRegex, "   ")));

	if (parts.length > 0) {
		const result = stackTraceFilter(parts);
		console.error(colors.stack_trace(result.replace(indentRegex, "   ")));
	}
};

/**
 * @method errorToStackTrace
 * @param {Error} err
 */
function errorToStackTrace(err?: Error | string | undefined): string {
	if (!isErrorObject(err)) {
		err = new Error(err);
	}

	const detailedErr = addDetailedError(err);

	let headline = detailedErr.message ? `${detailedErr.name}: ${detailedErr.message}` : detailedErr.name;
	headline = colors.red(headline.replace(indentRegex, " "));

	if (detailedErr.detailedErr) {
		headline += `\n ${colors.light_green(detailedErr.detailedErr)}`;
		if (detailedErr.extraDetail) {
			headline += `\n ${colors.light_green(detailedErr.extraDetail)}`;
		}
	}

	const showStack = detailedErr.showTrace || detailedErr.showTrace === undefined;
	let stackTrace = "";

	if (!showStack && detailedErr.reportShown) {
		return " " + headline;
	}

	if (!showStack) {
		return "\n" + boxen(`${headline}\n`, {padding: 1, borderColor: "red"}) + "\n";
	}

	stackTrace = filterStack(err);
	stackTrace = "\n" + colors.stack_trace(stackTrace.replace(indentRegex, "   "));

	return `${headline}${stackTrace}`;
};

export = {
	errorToStackTrace,
	stackTraceFilter,
	filterStack,
	filterStackTrace,
	showStackTrace
};
