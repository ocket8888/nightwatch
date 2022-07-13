const Settings = {
	enabled: process.env.COLORS !== "0"
};

class Background {

	public static readonly backgroundColors: Readonly<Record<string | symbol, string>> = {
		black: "40",
		red: "41",
		green: "42",
		yellow: "43",
		blue: "44",
		magenta: "45",
		cyan: "46",
		light_gray: "47"
	};

	private static getBackgroundColoredText(color: string): string {
		return `\u{1b}[${Background.backgroundColors[color]}m`;
	}

	public black(): string {
		return Background.getBackgroundColoredText("black");
	}
	public red(): string {
		return Background.getBackgroundColoredText("red");
	}
	public green(): string {
		return Background.getBackgroundColoredText("green");
	}
	public yellow(): string {
		return Background.getBackgroundColoredText("yellow");
	}
	public blue(): string {
		return Background.getBackgroundColoredText("blue");
	}
	public magenta(): string {
		return Background.getBackgroundColoredText("magenta");
	}
	public cyan(): string {
		return Background.getBackgroundColoredText("cyan");
	}
	public light_gray(): string {
		return Background.getBackgroundColoredText("light_gray");
	}
}

class ConsoleColor {
	background: Background;

	public static readonly foregroundColors: Readonly<Record<string | symbol, string>> = {
		black: "0;30",
		dark_gray: "1;30",
		blue: "0;34",
		light_blue: "1;34",
		green: "0;32",
		light_green: "1;32",
		cyan: "0;36",
		light_cyan: "1;36",
		red: "0;31",
		light_red: "1;31",
		purple: "0;35",
		light_purple: "1;35",
		brown: "0;33",
		yellow: "1;33",
		light_gray: "0;37",
		white: "1;37",
		stack_trace: "0;90"
	};

	constructor() {
		this.background = new Background();
	}

	private static getForegroundColoredText(text: string, color: string, background?: () => string): string {
		if (!Settings.enabled) {
			return text;
		}
		let string = `\u{1b}[${ConsoleColor.foregroundColors[color]}m`;
		if (background !== undefined) {
			string += background();
		}
		return string + `${text}\u{1b}[0m]`;
	}

	public black(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "black", background);
	}
	public dark_gray(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "dark_gray", background);
	}
	public blue(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "blue", background);
	}
	public light_blue(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "light_blue", background);
	}
	public green(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "green", background);
	}
	public light_green(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "light_green", background);
	}
	public cyan(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "cyan", background);
	}
	public light_cyan(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "light_cyan", background);
	}
	public red(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "red", background);
	}
	public light_red(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "light_red", background);
	}
	public purple(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "purple", background);
	}
	public light_purple(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "light_purple", background);
	}
	public brown(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "brown", background);
	}
	public yellow(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "yellow", background);
	}
	public light_gray(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "light_gray", background);
	}
	public white(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "white", background);
	}
	public stack_trace(text: string, background?: () => string): string {
		return ConsoleColor.getForegroundColoredText(text, "stack_trace", background);
	}
}

class Colors {
	private instance!: ConsoleColor;

	public static disable(): void {
		Settings.enabled = false;
	}

	private setup(): void {
		this.instance = new ConsoleColor();
	}

	constructor() {
		if (!Settings.enabled) {
			Colors.disable();
		}
		this.setup();
	}

	public disableColors(): void {
		Colors.disable();
		this.setup();
	}

	public disable(): void {
		Colors.disable();
		this.setup();
	}

	public enable(): void {
		this.setup();
	}

	public get colors(): ConsoleColor {
		return this.instance;
	}

	public get colorsEnabled(): boolean {
		return Settings.enabled;
	}
}

export = new Colors();
