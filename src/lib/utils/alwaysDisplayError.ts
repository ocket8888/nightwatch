function alwaysDisplayError(err: unknown): err is TypeError | SyntaxError | ReferenceError | RangeError {
	return (err instanceof Error) && [
		"TypeError", "SyntaxError", "ReferenceError", "RangeError"
	].includes(err.name);
}

export = alwaysDisplayError;
