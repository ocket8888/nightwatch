import * as path from "path";
import * as fs from "fs";
import glob from "glob";
import lodashMerge from "lodash.merge";
import { By } from "selenium-webdriver";

import Logger from "./logger";
import BrowserName from "./browsername";
import LocateStrategy from "./locatestrategy";
import PeriodicPromise from "./periodic-promise";
import createPromise from "./createPromise";
import isErrorObject from "./isErrorObject";
import alwaysDisplayError from "./alwaysDisplayError";
import Screenshots from "./screenshots";
import TimedCallback from "./timed-callback";
import getFreePort from "./getFreePort";
import requireModule from "./requireModule";
import getAllClassMethodNames from "./getAllClassMethodNames";
import printVersionInfo from "./printVersionInfo";
import StackTrace from "./stackTrace";
import beautifyStackTrace from "./beautifyStackTrace";
import SafeJSON from "./safeStringify";

const {filterStack, filterStackTrace, showStackTrace, stackTraceFilter, errorToStackTrace} = StackTrace;

const formatRegExp = /%[sdj%]/g;
const testSuiteNameRegxp = /(_|-|\.)*([A-Z]*)/g;
const nameSeparatorRegxp = /(\s|\/)/;

const PrimitiveTypes = {
	OBJECT: "object",
	FUNCTION: "function",
	BOOLEAN: "boolean",
	NUMBER: "number",
	STRING: "string",
	UNDEFINED: "undefined"
};

interface SelectorObjectDefinition {
	selector: string;
	webElementLocator?: unknown;
}

interface GlobalSelectorObjectDefinition extends SelectorObjectDefinition {
	webElementLocator: By;
}

type SelectorDefinition = string | SelectorObjectDefinition;

class Utils {
	public static get tsFileExt() {
		return ".ts";
	}

	public static get jsFileExt() {
		return ".js";
	}

	public static isObject(obj: unknown): obj is object {
		return obj !== null && typeof obj == "object";
	}

	public static isFunction(fn: unknown): fn is Function {
		return typeof fn == PrimitiveTypes.FUNCTION;
	}

	public static isBoolean(value: unknown): value is boolean {
		return typeof value == PrimitiveTypes.BOOLEAN;
	}

	public static isNumber(value: unknown): value is number {
		return typeof value == PrimitiveTypes.NUMBER;
	}

	public static isString(value: unknown): value is string {
		return typeof value == PrimitiveTypes.STRING;
	}

	public static isUndefined(value: unknown): value is undefined {
		return typeof value == PrimitiveTypes.UNDEFINED;
	}

	public static isDefined<T>(value: T | undefined): value is T {
		return !Utils.isUndefined(value);
	}

	public static isES6AsyncFn<T = unknown>(fn: unknown): fn is () => Promise<T> {
		return Utils.isFunction(fn) && fn.constructor.name === "AsyncFunction";
	}

	public static enforceType(value: unknown, type: string): void {
		type = type.toLowerCase();

		switch (type) {
		case PrimitiveTypes.STRING:
		case PrimitiveTypes.BOOLEAN:
		case PrimitiveTypes.NUMBER:
		case PrimitiveTypes.FUNCTION:
			if (typeof value !== type) {
				throw new Error(`Invalid type ${typeof value} for value "${value}". Expecting "${type}" instead.`);
			}

			return;
		}

		throw new Error(`Invalid type ${type} for ${value}`);
	}

	public static convertBoolean(value: unknown): boolean {
		if (Utils.isString(value) && (!value || value === "false" || value === "0")) {
			return false;
		}

		return Boolean(value);
	}

	public static get symbols() {
		let ok = String.fromCharCode(10004);
		let fail = String.fromCharCode(10006);

		if (process.platform === "win32") {
			ok = "\u221A";
			fail = "\u00D7";
		}

		return {
			ok: ok,
			fail: fail
		};
	}

	/**
   * @param {object|string} definition
   * @return {object}
   */
	public static convertToElementSelector(definition?: undefined): undefined;
	public static convertToElementSelector(definition: null): null;
	public static convertToElementSelector(definition: SelectorDefinition): SelectorObjectDefinition;
	public static convertToElementSelector(definition?: SelectorDefinition | null | undefined): SelectorObjectDefinition | null | undefined;
	public static convertToElementSelector(definition?: SelectorDefinition | null | undefined): SelectorObjectDefinition | null | undefined {
		const selector = Utils.isString(definition) ? {selector: definition} : definition;

		return selector;
	}

	public static isElementGlobal(selector: {webElementLocator?: unknown}): selector is {webElementLocator: By} {
		return selector.webElementLocator instanceof By;
	}

	/**
   * @param {object} definition
   * @param {object} [props]
   * @return {object}
   */
	public static setElementSelectorProps<T extends {}>(definition?: undefined, props?: T | null | undefined): undefined;
	public static setElementSelectorProps<T extends {}>(definition: null, props?: T | null | undefined): null;
	public static setElementSelectorProps<T extends {}>(definition: GlobalSelectorObjectDefinition, props?: T | null | undefined): GlobalSelectorObjectDefinition;
	public static setElementSelectorProps<T extends {}>(definition: SelectorDefinition, props?: null | undefined): SelectorDefinition;
	public static setElementSelectorProps<T extends {}>(definition: SelectorDefinition, props: T): SelectorDefinition & T;
	public static setElementSelectorProps<T extends {}>(definition?: SelectorDefinition | null | undefined, props?: T | null | undefined): GlobalSelectorObjectDefinition | SelectorObjectDefinition | (SelectorObjectDefinition & T) | null | undefined {
		const selector = Utils.convertToElementSelector(definition);
		if (!selector || Utils.isElementGlobal(selector)) {
			return selector;
		}

		if (props === null || props === undefined) {
			return selector;
		}

		return Object.assign(selector, props);

		// Object.keys(props).forEach(function(key) {
		// 	selector[key] = props[key];
		// });

		// return selector;
	}

	public static formatElapsedTime(timeMs: number, includeMs = false): string {
		const seconds = timeMs/1000;

		if (seconds < 1) {
			return `${timeMs}ms`;
		}
		if (seconds > 1 && seconds < 60) {
			return `${seconds}s`;
		}
		return `${Math.floor(seconds/60)}m ${Math.floor(seconds%60)}s${includeMs ? ` / ${timeMs}ms` : ""}`;
	}

	/**
   * Wrap a synchronous function, turning it into an psuedo-async fn with a callback as
   * the last argument if necessary. `asyncArgCount` is the expected argument
   * count if `fn` is already asynchronous.
   *
   * @deprecated
   * @param {number} asyncArgCount
   * @param {function} fn
   * @param {object} [context]
   */
	public static makeFnAsync<T, U extends Function>(asyncArgCount: number, fn: U, context: T | null): U | ((done: () => void, ...args: unknown[]) => void) {
		if (fn.length === asyncArgCount) {
			return fn;
		}

		return function(done: () => void, ...args: unknown[]) {
			context = context || null;
			fn.apply(context, args);
			done();
		};
	}

	public static async makePromise<T extends Function>(handler: T, context: unknown, args: ArrayLike<unknown>): Promise<unknown> {
		const result = Reflect.apply(handler, context, args);
		if (result instanceof Promise) {
			return result;
		}

		return Promise.resolve(result);
	}

	public static checkFunction<T extends PropertyKey>(name: T, parent?: Record<T, Function | unknown> | null | undefined): Function | false {
		if (!parent) {
			return false;
		}
		const prop = parent[name];
		if (typeof(prop) === "function") {
			return prop;
		}
		return false;
	}

	public static getTestSuiteName(moduleName: string): string {
		moduleName = moduleName.replace(testSuiteNameRegxp, (match, _, $1, offset, string) => {
			if (!match) {
				return "";
			}

			return (offset > 0 && (string.charAt(offset-1) !== " ") ? " ":"") + $1;
		});

		const words = moduleName.split(nameSeparatorRegxp).map(word => {
			if (word === "/") {
				return "/";
			}

			return word.charAt(0).toUpperCase() + word.substr(1);
		});

		return words.join("");
	}

	/**
   * A smaller version of util.format that doesn't support json and
   * if a placeholder is missing, it is omitted instead of appended
   *
   * @param f
   * @returns {string}
   */
	public static format(message: unknown, selector: unknown, timeMS: unknown): string {
		return String(message).replace(formatRegExp, function(exp) {
			if (exp === "%%") {
				return "%";
			}

			switch (exp) {
			case "%s":
				return String(selector);

			case "%d":
				return Number(timeMS).toString();

			default:
				return exp;
			}
		});
	}

	public static getModuleKey(filePath: string, srcFolders: Array<string>, fullPaths: {length: number}): string {
		const modulePathParts = filePath.split(path.sep);
		let diffInFolder = "";
		let folder = "";
		let parentFolder = "";
		const moduleName = modulePathParts.pop() as string;
		filePath = modulePathParts.join(path.sep);

		if (srcFolders) {
			for (let i = 0; i < srcFolders.length; i++) {
				folder = path.resolve(srcFolders[i]);
				if (fullPaths.length > 1) {
					parentFolder = folder.split(path.sep).pop() as string;
				}
				if (filePath.indexOf(folder) === 0) {
					diffInFolder = filePath.substring(folder.length + 1);
					break;
				}
			}
		}

		return path.join(parentFolder, diffInFolder, moduleName);
	}

	public static getOriginalStackTrace(commandFn: Function | {stackTrace: string}) {
		let originalStackTrace;

		if (((x: Function | {stackTrace: string}): x is {stackTrace: string} => Object.prototype.hasOwnProperty.call(x, "stackTrace"))(commandFn)) {
			originalStackTrace = commandFn.stackTrace;
		} else {
			const err = new Error;
			Error.captureStackTrace(err, commandFn);
			originalStackTrace = err.stack;
		}

		return originalStackTrace;
	}

	// util to replace deprecated fs.existsSync
	public static dirExistsSync(path: fs.PathLike): boolean {
		try {
			return fs.statSync(path).isDirectory(); // eslint-disable-next-line no-empty
		} catch (e) {}

		return false;
	}

	public static fileExistsSync(path: fs.PathLike): boolean {
		try {
			return fs.statSync(path).isFile(); // eslint-disable-next-line no-empty
		} catch (e) {}

		return false;
	}

	public static async fileExists(path: string): Promise<boolean> {
		try {
			const stats = await Utils.checkPath(path);
			if (!stats) {
				return false;
			}
			return stats.isFile();
		} catch {
			return false;
		}
	}

	public static isTsFile(fileName: string): boolean {
		return (path.extname(fileName) === Utils.tsFileExt);
	}

	public static isFileNameValid(fileName: string): boolean {
		return [
			Utils.jsFileExt,
			".mjs",
			".cjs",
			Utils.tsFileExt
		].includes(path.extname(fileName));
	}

	public static async checkPath(source: string, originalErr = null, followSymlinks = true): Promise<fs.Stats | void>  {
		return new Promise(function(resolve, reject) {
			if (glob.hasMagic(source)) {
				return resolve();
			}

			const handler = (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
				if (err) {
					return reject(err.code === "ENOENT" && originalErr || err);
				}
				resolve(stats);
			};
			if (followSymlinks) {
				fs.stat(source, handler);
			} else {
				fs.lstat(source, handler);
			}
		});
	}

	/**
   * @param {string} source
   * @return {Promise}
   */
	public static async isFolder(source: string): Promise<boolean> {
		const stats = await Utils.checkPath(source, null, false);
		if (!stats) {
			return false;
		}
		return stats.isDirectory();
	}

	/**
   * @param {string} source
   * @return {Promise}
   */
	public static readDir(source: string): Promise<Array<string>> {
		return new Promise(function(resolve, reject) {
			const callback = (err: NodeJS.ErrnoException | null, list: Array<string>) => {
				if (err) {
					return reject(err);
				}
				resolve(list);
			};

			glob.hasMagic(source) ? glob(source, callback) : fs.readdir(source, callback);
		});
	}

	/**
   *
   * @param {string} sourcePath
   * @param {Array} namespace
   * @param {function} loadFn
   * @param {function} readSyncFn
   */
	public static readFolderRecursively(sourcePath: string, namespace: Array<string> = [], loadFn: (sourcePath: string, resource: string, namespace: Array<string>) => void, readSyncFn?: (path: string) => {sourcePath: string; resources: Array<string>}) {
		let resources: Array<string>;
		if (glob.hasMagic(sourcePath)) {
			resources = glob.sync(sourcePath);
		} else if (Utils.isFunction(readSyncFn)) {
			const result = readSyncFn(sourcePath);
			sourcePath = result.sourcePath;
			resources = result.resources;
		} else {
			resources = fs.readdirSync(sourcePath);
		}

		resources.sort(); // makes the list predictable
		resources.forEach(resource => {
			if (path.isAbsolute(resource)) {
				sourcePath = path.dirname(resource);
				resource = path.basename(resource);
			}

			const isFolder = fs.lstatSync(path.join(sourcePath, resource)).isDirectory();
			if (isFolder) {
				const pathFolder = path.join(sourcePath, resource);
				const ns = namespace.slice(0);
				ns.push(resource);
				Utils.readFolderRecursively(pathFolder, ns, loadFn);

				return;
			}

			loadFn(sourcePath, resource, namespace);
		});
	}

	public static getPluginPath(pluginName: string): string {
		return path.resolve(require.resolve(pluginName, {
			paths: [process.cwd()]
		}));
	}

	public static singleSourceFile(argv: {test?: undefined | string; _source?: undefined | Array<string>} = {test: undefined, _source: undefined}): boolean {
		const {test, _source} = argv;

		if (Utils.isString(test)) {
			return Utils.fileExistsSync(test);
		}

		return Array.isArray(_source) && _source.length === 1 && Utils.fileExistsSync(_source[0]);
	}

	public static getConfigFolder(argv?: {config?: string}): string {
		if (!argv || !argv.config) {
			return "";
		}

		[[[]]].flat(Infinity);
		return path.dirname(argv.config);
	}

	/**
   *
   * @deprecated Maintaining this is a pointless annoyance; use Array.prototype.flat and/or Array.prototype.filter instead.
   *
   * @param {Array} arr
   * @param {number} maxDepth
   * @param {Boolean} includeEmpty
   * @returns {Array}
   */
	public static flattenArrayDeep<T extends unknown[]>(arr: Array<T>, maxDepth = 4, includeEmpty = false): FlatArray<T, typeof Infinity> {
		if (!Array.isArray(arr)) {
			throw new Error(`Utils.flattenArrayDeep excepts an array to be passed. Received: "${arr === null ? arr : typeof arr}".`);
		}

		return (function flatten(currentArray: Array<T>, currentDepth, initialValue: Array<T> = []): FlatArray<T, typeof Infinity> {
			currentDepth = currentDepth + 1;

			return currentArray.reduce((prev: T, value: T): T => {
				if (Array.isArray(value)) {
					const result = prev.concat(value);
					if (Array.isArray(result) && currentDepth <= maxDepth) {
						return flatten(result, currentDepth) as T;
					}

					return result as T;
				}

				currentDepth = 0;

				if (!includeEmpty && (value === null || value === undefined || value === "")) {
					return prev;
				}

				prev.push(value);

				return prev;
			}, initialValue as T) as FlatArray<T, typeof Infinity>;
		})(arr, 0);
	}

	/**
   * Strips out all control characters from a string
   * However, excludes newline and carriage return
   *
   * @param {string} input String to remove invisible chars from
   * @returns {string} Initial input string but without invisible chars
   */
	public static stripControlChars(input: string): string {
		return input && input.replace(
			// eslint-disable-next-line no-control-regex
			/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
			""
		);
	}

	public static relativeUrl(url: string): boolean {
		return !(url.includes("://"));
	}

	public static uriJoin(baseUrl: string, uriPath: string): string {
		let result = baseUrl;

		if (baseUrl.endsWith("/")) {
			result = result.substring(0, result.length - 1);
		}

		if (!uriPath.startsWith("/")) {
			result = result + "/";
		}

		return result + uriPath;
	}

	public static replaceParams(url: string, params: Record<string, string> = {}): string {
		return Object.keys(params).reduce(function(prev, param) {
			prev = prev.replace(`:${param}`, params[param]);

			return prev;
		}, url);
	}

	public static async createFolder(dirPath: fs.PathLike): Promise<void> {
		return new Promise((resolve, reject) => {
			fs.mkdir(dirPath, {recursive: true}, function(err) {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		});
	}

	public static containsMultiple(arrayOrString: string | Array<string>, valueToFind: string | Array<string>, separator = ",") {
		if (typeof valueToFind == "string") {
			valueToFind = valueToFind.split(separator);
		}

		if (Array.isArray(valueToFind)) {
			if (valueToFind.length > 1) {
				return valueToFind.every(item => arrayOrString.includes(item));
			}

			valueToFind = valueToFind[0];
		}

		return arrayOrString.includes(valueToFind);
	}

	public static shouldReplaceStack(err: unknown): boolean {
		return !alwaysDisplayError(err);
	}
}

lodashMerge(Utils, {
	PrimitiveTypes,
	BrowserName,
	LocateStrategy,
	Logger,
	isErrorObject,
	requireModule,
	createPromise,
	getAllClassMethodNames,
	SafeJSON,

	filterStack,
	filterStackTrace,
	showStackTrace,
	stackTraceFilter,
	errorToStackTrace,

	PeriodicPromise,
	Screenshots,
	TimedCallback,

	getFreePort,
	printVersionInfo,

	alwaysDisplayError,
	beautifyStackTrace
});

export = Utils;
