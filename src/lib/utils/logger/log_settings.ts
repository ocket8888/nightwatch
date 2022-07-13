type Settings = {
	detailedOutput: boolean;
	disableErrorLog: boolean;
	enabled: boolean;
	htmlReporterEnabled?: boolean | undefined;
	log_timestamp: boolean;
	outputEnabled: boolean;
	showRequestData: {
		enabled: boolean;
		trimLongScripts: boolean;
	};
	showResponseHeaders: boolean;
	timestamp_format: string | null;
}

class LogSettings {

	private logSettings: Settings = {
		outputEnabled: true,
		showResponseHeaders: false,
		showRequestData: {
			enabled: true,
			trimLongScripts: true
		},
		detailedOutput: true,
		disableErrorLog: false,
		log_timestamp: false,
		timestamp_format: null,
		enabled: true
	};

	public get outputEnabled(): boolean {
		return this.logSettings.outputEnabled;
	}
	public set outputEnabled(value: boolean | undefined) {
		this.logSettings.outputEnabled = value ?? true;
	}

	public get detailedOutput(): boolean {
		return this.logSettings.detailedOutput;
	}
	public set detailedOutput(value: boolean) {
		this.logSettings.detailedOutput = value;
	}

	public get showRequestData(): {enabled: boolean, trimLongScripts: boolean} {
		return this.logSettings.showRequestData;
	}

	public get enabled(): boolean {
		return this.logSettings.enabled;
	}

	public get showResponseHeaders(): boolean {
		return this.logSettings.showResponseHeaders;
	}

	public get timestampFormat(): string | null {
		return this.logSettings.timestamp_format;
	}

	public set disableErrorLog(value: boolean | undefined) {
		this.logSettings.disableErrorLog = value ?? true;
	}

	public set htmlReporterEnabled(value: boolean | undefined) {
		this.logSettings.htmlReporterEnabled = value;
	}

	public get htmlReporterEnabled(): boolean | undefined {
		return this.logSettings.htmlReporterEnabled;
	}

	public isLogTimestamp(): boolean {
		return this.logSettings.log_timestamp;
	}

	public isErrorLogEnabled(): boolean {
		return !this.logSettings.disableErrorLog;
	}

	public disable(): void {
		this.logSettings.enabled = false;
	}

	public enable(): void {
		this.logSettings.enabled = true;
	}

	public setLogTimestamp(val: boolean, format: string | null) {
		this.logSettings.log_timestamp = val;
		this.logSettings.timestamp_format = format;
	}

	public setHttpLogOptions({showRequestData, showResponseHeaders}: {showRequestData: {enabled: boolean; trimLongScripts: boolean}; showResponseHeaders: boolean}): void {
		this.logSettings.showRequestData = showRequestData;
		this.logSettings.showResponseHeaders = showResponseHeaders;
	}
}

export = new LogSettings();
