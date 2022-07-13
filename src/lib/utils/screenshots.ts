import * as path from "path";
import * as fs from "fs";
import Defaults from "../settings/defaults";

type ScreenshotsType = {
	filename_format?: (arg: {testSuite?: string | undefined; testCase?: string | undefined; isError?: boolean | undefined}) => string;
	path: string;
};

class Screenshots {
	/**
	 * @param {object} prefix
	 * @param {object} screenshots
	 * @return {string}
	 */
	public static getFileName({testSuite, testCase, isError = false}: {testSuite?: string | undefined; testCase?: string | undefined; isError?: boolean}, screenshots: ScreenshotsType) {
		const dateObject = new Date();
		let filename;
		let filename_format;

		if (typeof screenshots.filename_format === "function") {
			filename_format = screenshots.filename_format.bind(screenshots);
		} else {
			filename_format = Defaults.screenshots.filename_format;
		}

		filename = filename_format({testSuite, testCase, isError, dateObject});
		filename = filename.replace(/\s/g, "-").replace(/["']/g, "");

		return path.join(screenshots.path, filename);
	}

	/**
   *
   * @param {String} fileName
   * @param {String} content
   * @param {function} cb
   */
	public static writeScreenshotToFile(fileName: string, content: string, cb: (err: NodeJS.ErrnoException | null, fileName?: string) => void = function() {}): void {
		const dir = path.resolve(fileName, "..");

		fs.mkdir(dir, {recursive: true}, function(err) {
			if (err) {
				cb(err);
			} else {
				fs.writeFile(fileName, content, "base64", function(err) {
					if (err) {
						cb(err);
					} else {
						cb(null, fileName);
					}
				});
			}
		});
	}
}

export = Screenshots;
