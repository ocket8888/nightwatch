function isErrorObject(err: unknown): err is Error {
	return err instanceof Error || Object.prototype.toString.call(err) === "[object Error]";
};

export = isErrorObject;
