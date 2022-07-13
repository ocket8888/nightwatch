export type CreatedPromise<T> = {
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
	promise: Promise<T>
};
