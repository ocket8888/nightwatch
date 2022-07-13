const __RECURSION__ = "recursion";

const enum STRATEGY {
	ID = "id",
	CSS_SELECTOR = "css selector",
	LINK_TEST = "link text",
	PARTIAL_LINK_TEXT = "partial link text",
	TAG_NAME = "tag name",
	XPATH = "xpath"
}

class LocateStrategy {
	static get Strategies() {
		return {
			ID: STRATEGY.ID,
			CSS_SELECTOR: STRATEGY.CSS_SELECTOR,
			LINK_TEST: STRATEGY.LINK_TEST,
			PARTIAL_LINK_TEXT: STRATEGY.PARTIAL_LINK_TEXT,
			TAG_NAME: STRATEGY.TAG_NAME,
			XPATH: STRATEGY.XPATH
		};
	}

	public static isValid(strategy: string): strategy is STRATEGY {
		switch(strategy.toLocaleLowerCase()) {
			case STRATEGY.ID:
			case STRATEGY.CSS_SELECTOR:
			case STRATEGY.LINK_TEST:
			case STRATEGY.PARTIAL_LINK_TEXT:
			case STRATEGY.TAG_NAME:
			case STRATEGY.XPATH:
				return true;
		}
		return false;
	}

	public static getList(): string {
		return Object.values(LocateStrategy.Strategies).join(", ");
	}

	public static get XPATH(): string {
		return LocateStrategy.Strategies.XPATH;
	}

	public static get CSS_SELECTOR(): string {
		return LocateStrategy.Strategies.CSS_SELECTOR;
	}

	public static getDefault(): string {
		return LocateStrategy.CSS_SELECTOR;
	}

	public static get Recursion(): string {
		return __RECURSION__;
	}
}

export = LocateStrategy;
