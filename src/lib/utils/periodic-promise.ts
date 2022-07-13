import EventEmitter from "events";
import type { CreatedPromise } from "./created.promise";
import createPromise from "./createPromise";

interface PeriodicPromiseArgs {
	rescheduleInterval: number;
	timeout: number;
}

type Result = {
	error?: Error;
	message: string;
	stack?: string | undefined;
	status: number;
};

interface PerformArgs<T = unknown> {
	action: (previous?: unknown) => Promise<Result>;
	errorHandler: (e: Error) => void;
	isResultStale?: (result?: unknown) => boolean;
	retryOnFailure: unknown;
	retryOnSuccess: unknown;
	shouldRetryOnError?: (result: unknown) => boolean;
	successHandler: (currentResult: Result) => Promise<Result>;
	validate: (result: unknown) => boolean;
}

interface RunActionArgs {
	prevResult?: unknown;
	prevQueuePromise?: PerformArgs;
}

interface ShouldRetryArgs {
	currentResult?: unknown;
	isValidResult?: unknown;
	retryOnFailure?: unknown;
	retryOnSuccess?: unknown;
	shouldRetryOnError: (result: unknown) => boolean;
}

class PeriodicPromise extends EventEmitter {
	public get rescheduleInterval(): number {
		return this.__rescheduleIntervalMs;
	}

	public get ms(): number {
		return this.__timeoutMs;
	}

	public get elapsedTime(): number {
		if (!this.startTime) {
			throw new Error("cannot calculate elapsed time for unstarted PeriodicPromise");
		}
		return new Date().getTime() - this.startTime;
	}

	public get queue(): Array<PerformArgs> {
		return this.__queue;
	}

	private readonly __rescheduleIntervalMs: number;
	private readonly __timeoutMs: number;
	private retries = 0;
	private readonly __queue = new Array<PerformArgs>();
	private startTime: number | null = null;

	constructor({
		rescheduleInterval,
		timeout
	}: PeriodicPromiseArgs) {
		super();

		this.__rescheduleIntervalMs = rescheduleInterval;
		this.__timeoutMs = timeout;
	}

	public queueAction(opts: PerformArgs): this {
		this.__queue.push(opts);

		return this;
	}

	public async runAction({prevResult, prevQueuePromise}: RunActionArgs): Promise<null | unknown> {
		const queuePromise = this.queue.shift();
		if (!queuePromise) {
			return null;
		}
		const deferred = createPromise<Result>();

		try {
			const result = await this.perform(queuePromise, {prevResult, prevQueuePromise}, deferred);

			if (this.queue.length) {
				return await this.runAction({
					prevResult: result,
					prevQueuePromise: queuePromise
				});
			}

			return result;
		} catch (err) {
			const e = err instanceof Error ? err : new Error(String(err));
			if (e.name === "TypeError" || e.name === "ReferenceError" || !queuePromise.errorHandler) {
				throw err;
			}

			if (queuePromise.errorHandler) {
				return queuePromise.errorHandler(e);
			}
		}
	}

	public async perform<T extends Result = Result>({
		action,
		validate,
		isResultStale,
		successHandler = (r: Result) => Promise.resolve(r),
		shouldRetryOnError = () => true,
		retryOnSuccess = false,
		retryOnFailure = true
	}: PerformArgs<T>, {prevResult, prevQueuePromise}: RunActionArgs, deferred: CreatedPromise<Result>) {
		let currentResult: Result;
		try {
			// running the current action using the result from the previous action
			currentResult = await action(prevResult);

			// if the current action returns a stale reference to the previous result, re-run the previous action
			if (isResultStale && isResultStale(currentResult)) {
				if (!prevQueuePromise) {
					throw new TypeError("prevQueuePromise is undefined");
				}
				const freshResult = await prevQueuePromise.action({cacheElementId: false});
				if (freshResult.error instanceof Error) {
					throw freshResult.error;
				}
				currentResult = await action(freshResult);
			}
		} catch (err) {
			const e = err instanceof Error ? err : new Error(String(err));
			currentResult = {
				status: -1,
				message: e.message,
				stack: e.stack
			};
		}

		const isValidResult = validate(currentResult);

		if (this.shouldRetry({retryOnSuccess, isValidResult, currentResult, shouldRetryOnError, retryOnFailure})) {
			this.reschedule(arguments[0], arguments[1], deferred);

			return deferred.promise;
		}

		if (isValidResult) {
			currentResult = await successHandler(currentResult);
			deferred.resolve(currentResult);

			return deferred.promise;
		}

		throw this.getError(currentResult);
	}

	public run() {
		this.startTime = new Date().getTime();

		return this.runAction({});
	}

	public reschedule(promise: PerformArgs, opts: RunActionArgs, deferred: CreatedPromise<Result>): void {
		setTimeout(() => {
			this.retries++;
			this.perform(promise, opts, deferred).catch(err => {
				deferred.reject(err);
			});
		}, this.rescheduleInterval);
	}

	public shouldRetry({retryOnFailure, retryOnSuccess, shouldRetryOnError, isValidResult, currentResult}: ShouldRetryArgs): boolean {
		const now = new Date().getTime();
		if (!this.startTime) {
			return false;
		}
		const timePassed = (now - this.startTime) >= this.ms;
		const retryOnFailureResult = typeof retryOnFailure == "function" ? retryOnFailure() : retryOnFailure;

		if (timePassed) {
			return false;
		}

		if (retryOnFailureResult && !isValidResult) {
			return shouldRetryOnError(currentResult);
		}

		const needsRetryOnSuccess = typeof retryOnSuccess == "function" ? retryOnSuccess(currentResult) : retryOnSuccess;

		return (needsRetryOnSuccess && isValidResult);
	}

	public getError(response: Error | {error?: string | Error; value?: {message?: string}; message?: string}) {
		if (response instanceof Error) {
			return response;
		}

		const {startTime, retries} = this;

		let {message = "timeout error"} = response;
		if (response.error) {
			message = response.error as string;
			if (response.value && response.value.message) {
				message = response.value.message;
			} else if ((response.error as Error).message) {
				message = (response.error as Error).message;
			}
		}

		return new TimeoutError({
			message,
			now: Date.now(),
			startTime,
			response,
			retries
		});
	}
}


type TimeoutErrorArgs = {
	message: string;
	now: number;
	response: unknown;
	startTime: number | null;
	retries: number;
};

class TimeoutError extends Error {
	public readonly now: number;
	public readonly response: unknown;
	public readonly startTime: number | null;
	public readonly retries: number;

	constructor({message, now, response, startTime, retries}: TimeoutErrorArgs) {
		super(message);

		this.name = "TimeoutError";
		this.now = now;
		this.response = response;
		this.startTime = startTime;
		this.retries = retries;
	}
}

export = PeriodicPromise;
