class TimeoutError extends Error {
	constructor(message?: string | undefined) {
		super(message);
		this.name = "TimeoutError";
	}
}

class TimedCallback<T = unknown> {

	private __onTimeoutExpired: null | ((err: TimeoutError, name: T, timeoutMs: number) => void) = null;
	private __onTimerStarted: null | ((timeoutID: NodeJS.Timeout) => void) = null;
	public timeoutId: NodeJS.Timeout | undefined;

	constructor(public callbackFn: (err: unknown) => void, public name: T, public timeoutMs: number) {
	}

	public get onTimeoutExpired(): (err: TimeoutError, name: T, timeoutMs: number) => void {
		return this.__onTimeoutExpired || function() {};
	}
	/**
	 * @param {function} val
	 */
	public set onTimeoutExpired(val: null | ((err: TimeoutError, name: T, timeoutMs: number) => void)) {
		this.__onTimeoutExpired = val;
	}

	public get onTimerStarted(): (timeoutID: NodeJS.Timeout) => void {
		return this.__onTimerStarted || function() {};
	}
	/**
	 * @param {function} val
	 */
	public set onTimerStarted(val: null | ((timeoutID: NodeJS.Timeout) => void)) {
		this.__onTimerStarted = val;
	}

	public getWrapper(): (err: unknown) => void {
		this.createTimeout();

		return err => {
			if (!this.timeoutId) {
				throw new Error("cannot clear timeout with undefined timeout ID");
			}
			clearTimeout(this.timeoutId);
			this.callbackFn(err);
		};
	}

	public createTimeout() {
		this.timeoutId = setTimeout(() => {
			const err = new TimeoutError(`done() callback timeout of ${this.timeoutMs}ms was reached while executing "${this.name}".` +
        " Make sure to call the done() callback when the operation finishes.");
			this.onTimeoutExpired(err, this.name, this.timeoutMs);
		}, this.timeoutMs);

		this.onTimerStarted(this.timeoutId);
	}
}

export = TimedCallback;
