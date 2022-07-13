type BrowserNameType = {
	readonly CHROME: string;
	readonly FIREFOX: string;
	readonly SAFARI: string;
	readonly EDGE: string;
	readonly INTERNET_EXPLORER: string;
	readonly OPERA: string;
};

const BrowserName: Readonly<BrowserNameType> = {
	get CHROME() {
		return "chrome";
	},

	get FIREFOX() {
		return "firefox";
	},

	get SAFARI() {
		return "safari";
	},

	get EDGE() {
		return "MicrosoftEdge";
	},

	get INTERNET_EXPLORER() {
		return "internet explorer";
	},

	get OPERA() {
		return "opera";
	}
};

Object.freeze(BrowserName);

export = BrowserName;
