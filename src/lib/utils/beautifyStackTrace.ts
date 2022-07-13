import * as fs from "fs";
import stackTraceParser from "stacktrace-parser";
import AssertionError from "assertion-error";
import StackTrace from "./stackTrace";
import alwaysDisplayError from "./alwaysDisplayError";
import Colors from "./colors";

const {filterStackTrace} = StackTrace;
const {colors} = Colors;

/**
 * Read the User file from the stackTrace and create a string with highlighting the line with error
 * @param {Error} err
 */
function beautifyStackTrace(err: Error): string {
	if ((err instanceof AssertionError) || alwaysDisplayError(err)) {
		try {
			const parsedStack = stackTraceParser.parse(filterStackTrace(err.stack))[0];
			// preserves old behavior
			if (!parsedStack || parsedStack.file === null) {
				throw new TypeError('[ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string or an instance of Buffer or URL. Received null');
			}

			const lineNo = parsedStack.lineNumber ?? 0;

			const lines = fs.readFileSync(parsedStack.file, "utf-8").split(/\r?\n/).reduce((lines, newLine, lineIndex) => {
				const currentLine = lineIndex + 1;
				if (currentLine === parsedStack.lineNumber) {
					lines += "\n " + colors.light_gray(` ${currentLine} | ${newLine} `, colors.background.black);
				} else if (currentLine <= (lineNo + 2) && currentLine >= (lineNo - 2)) {
					lines += `\n  ${currentLine} | ${newLine}`;
				}

				return lines;
			}, "");

			const delimiter = (new Array(parsedStack.file.length + 3).join("–"));

			return " "  + parsedStack.file + ":\n " + delimiter + lines + "\n " + delimiter + "\n";
		} catch (err) {
			return "";
		}
	}

	return "";
}

export = beautifyStackTrace;
