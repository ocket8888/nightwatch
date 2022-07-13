import util from "util";
import LogSettings from "./log_settings";
import Colors from "../colors";
import isErrorObject from "../isErrorObject";
import stackTrace from "../stackTrace";

const {colors, colorsEnabled, disableColors} = Colors;
const {errorToStackTrace} = stackTrace;

const enum Severity {
	LOG = "LOG",
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR"
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
	"Oct", "Nov", "Dec"];

function pad(n: number): string {
	return n < 10 ? "0" + n.toString(10) : n.toString(10);
}

let __instance__: Logger;

// 26 Feb 16:19:34
function timestamp(d: Date = new Date(), format?: string | null | undefined): string {
	if (format === "iso") {
		return d.toISOString();
	}

	const time = [
		pad(d.getHours()),
		pad(d.getMinutes()),
		pad(d.getSeconds())
	].join(":");

	return [d.getDate(), months[d.getMonth()], time].join(" ");
}

function inspectObject(obj: unknown): string {
	return util.inspect(obj, {
		showHidden: false,
		depth: 4,
		colors: colorsEnabled
	})
		.replace(/^\s{2}/gm, "     ")
		.replace(/^}$/m, "  }");
}

function logObject(obj: unknown): void {
	// eslint-disable-next-line no-console
	console.log("  ", inspectObject(obj));
}

function logTimestamp(d?: Date | undefined) {
	if (LogSettings.isLogTimestamp()) {
		return colors.white(timestamp(d, LogSettings.timestampFormat));
	}

	return "";
}

function logMessage(type: Severity, message: string, args: Array<unknown>, alwaysShow?: boolean) {
	if (!message || !LogSettings.outputEnabled || !LogSettings.enabled && !alwaysShow) {
		return;
	}

	let messageStr = "";
	let logMethod: "log" | "error" | "warn" = "log";
	// let prefix;
	const d = new Date();
	// const timeIso = d.toISOString();
	let timestamp = logTimestamp(d);

	switch (type) {
	case Severity.ERROR:
		// prefix = colors.yellow(type, colors.background.black);
		messageStr = colors.light_red(message);
		logMethod = "error";
		break;

	case Severity.INFO:
		// prefix = colors.light_purple(type, colors.background.black);
		messageStr = colors.light_cyan(message);
		break;

	case Severity.LOG:
		// prefix = colors.white(type + " ", colors.background.black);
		messageStr = colors.white(message);
		break;

	case Severity.WARN:
		// prefix = colors.light_green(type, colors.background.black);
		messageStr = colors.light_green(message);
		logMethod = "warn";
		break;
	}

	if (LogSettings.timestampFormat === "iso") {
		let severity = type.toUpperCase();
		if (severity === Severity.LOG) {
			severity = Severity.INFO;
		}

		timestamp += ` ${severity} nightwatch:`;
	}

	// eslint-disable-next-line no-console
	console[logMethod](timestamp, messageStr);

	if (args.length > 0) {
		let inlineArgs = new Array<unknown>();
		args.forEach(function(item) {
			if (item === undefined || item === null) {
				return;
			}

			if (typeof(item) === "object" && Object.keys(item).length > 0) {
				if (inlineArgs.length) {
					// eslint-disable-next-line no-console
					console[logMethod](...inlineArgs);
					inlineArgs = [];
				}
				logObject(item);
			} else {
				inlineArgs.push(item);
			}
		});

		if (inlineArgs.length) {
			// eslint-disable-next-line no-console
			console[logMethod](...inlineArgs);
			inlineArgs = [];
		}
	}
}

function logRequest(message: string, params: unknown): void {
	if (!message || !LogSettings.htmlReporterEnabled) {
		return;
	}

	const d = new Date();
	const timeIso = d.toISOString();
	const instance = Logger.getInstance();

	instance.output.push([timeIso, message, inspectObject(params)]);
}

function logError(severity: Severity, errOrMessage: Error | string, args: Array<unknown>) {
	if (isErrorObject(errOrMessage)) {
		errOrMessage = errorToStackTrace(errOrMessage);
	}

	const alwaysDisplay = LogSettings.isErrorLogEnabled() && severity === Severity.ERROR;

	logMessage(severity, errOrMessage, args, alwaysDisplay);
}

interface LoggerSettings {
	output?: boolean | undefined;
	output_folder?: unknown;
	detailed_output: boolean;
	output_timestamp: boolean;
	timestamp_format: string | null;
	disable_error_log?: boolean | undefined;
	disable_colors?: unknown;
	silent?: unknown;
}

class Logger {
	public static getInstance(): Logger {
		return __instance__;
	}

	public output = new Array<Array<string>>();
	public colors: typeof Colors.colors = colors;

	public logMessage(severity: Severity, message: string, args: [...unknown[], boolean] | unknown[]): void {
		if (args.length > 0) {
			const lastArg = args.slice(-1)[0];
			if (typeof(lastArg) === "boolean") {
				return logMessage(severity, message, args.slice(0, -1), lastArg);
			}
		}
		logMessage(severity, message, args);
	}

	public inspectObject(obj: unknown): string {
		return inspectObject(obj);
	}

	public info(message: string, ...args: [...unknown[], boolean] | unknown[]): void {
		logMessage(Severity.INFO, message, args);
	}

	public log(message: string, ...args: [...unknown[], boolean] | unknown[]): void {
		logMessage(Severity.LOG, message, args);
	}

	public warn(message: string, ...args: [...unknown[], boolean] | unknown[]): void {
		logError(Severity.WARN, message, args);
	}

	public error(message: string, ...args: [...unknown[], boolean] | unknown[]): void {
		logError(Severity.ERROR, message, args);
	}

	public request(message: string, params: unknown): void {
		logRequest(message, params);
	}

	public response(message: string, params: unknown): void {
		logRequest(message, params);
	}

	public underline(text: string): string {
		if (!this.colors) {
			return text;
		}

		return `\u{1b}[4m${text}\u{1b}[24m`;
	}

	public setOptions(settings: LoggerSettings) {
		this.setOutputEnabled(settings.output);
		this.setHtmlReporterEnabled(typeof settings.output_folder == "string");
		this.setDetailedOutput(settings.detailed_output);
		this.setLogTimestamp(settings.output_timestamp, settings.timestamp_format);
		this.setErrorLog(settings.disable_error_log);

		if (settings.disable_colors) {
			this.disableColors();
		}

		if (settings.silent) {
			this.disable();
		} else {
			this.enable();
		}
	}

	public disableColors(): void {
		disableColors();
		this.colors = colors;
	}

	public setHtmlReporterEnabled(value?: boolean | undefined): void {
		LogSettings.htmlReporterEnabled = value;
	}

	public disable(): void {
		LogSettings.disable();
	}

	public enable(): void {
		LogSettings.enable();
	}

	public setOutputEnabled(val: boolean = true): void {
		LogSettings.outputEnabled = val;
	}

	public isOutputEnabled(): boolean {
		return LogSettings.outputEnabled;
	}

	public isHtmlReporterEnabled(): boolean | undefined  {
		return LogSettings.htmlReporterEnabled;
	}

	public setDetailedOutput(val: boolean): void {
		LogSettings.detailedOutput = val;
	}

	public isDetailedOutput(): boolean {
		return LogSettings.outputEnabled && LogSettings.detailedOutput;
	}

	public setLogTimestamp(val: boolean, format: string | null): void {
		LogSettings.setLogTimestamp(val, format);
	}

	public setHttpLogOptions(opts: {showRequestData: {enabled: boolean; trimLongScripts: boolean}; showResponseHeaders: boolean}): void {
		LogSettings.setHttpLogOptions(opts);
	}

	public showRequestData(): {enabled: boolean; trimLongScripts: boolean} {
		return LogSettings.showRequestData;
	}

	public showResponseHeaders(): boolean {
		return LogSettings.showResponseHeaders;
	}

	public isLogTimestamp(): boolean {
		return LogSettings.isLogTimestamp();
	}

	public isErrorLogEnabled(): boolean {
		return LogSettings.isErrorLogEnabled();
	}

	public isEnabled(): boolean {
		return LogSettings.enabled;
	}

	public setErrorLog(val: boolean = false): void {
		LogSettings.disableErrorLog = val;
	}

	public logDetailedMessage(message: string, type: "log" | "warn" | "debug" | "dir" | "info" | "error" | "dirxml" = "log") {
		if (!LogSettings.outputEnabled || !LogSettings.detailedOutput) {
			return;
		}

		// eslint-disable-next-line no-console
		console[type](message);
	}

	public formatMessage(msg: string, ...args: string[]) {
		args = args.map(val => {
			return colors.brown(val);
		});

		return util.format(msg, ...args);
	}
}

__instance__ = new Logger();
export = module.exports = Logger.getInstance();

const getOutput = module.exports.getOutput = function(): Array<Array<string>> {
	if (!Logger.getInstance()) {
		return [];
	}

	const {output} = Logger.getInstance();

	return output.slice(0);
};

module.exports.collectOutput = function(): Array<Array<string>> {
	const instance = Logger.getInstance();

	if (!instance) {
		return [];
	}

	const output = getOutput();
	instance.output = [];

	return output;
};
