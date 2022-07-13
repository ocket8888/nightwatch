import type { CreatedPromise } from "./created.promise.d";

/**
 * @return {{resolve, reject, promise}}
 */
 function createPromise<T = unknown>(): CreatedPromise<T> {
	const deferred: CreatedPromise<T> = {
		resolve: null,
		reject: null,
		promise: null
	} as unknown as CreatedPromise<T>;

	deferred.promise = new Promise((resolve, reject) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

	return deferred;
}

export = createPromise;
