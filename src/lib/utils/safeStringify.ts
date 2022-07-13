function hasToJSON(obj: {}): obj is ({toJSON: () => unknown}) {
	return Object.prototype.hasOwnProperty.call(obj, "toJSON") && typeof(obj as {toJSON: unknown}).toJSON === "function";
}

class SafeStringify {
	public static visit(obj: unknown, seen: Array<unknown>): unknown {
		if (obj == null || typeof obj !== "object") {
			return obj;
		}

		if (seen.indexOf(obj) !== -1) {
			return "[Circular]";
		}
		seen.push(obj);

		if (hasToJSON(obj)) {
			try {
				const result = this.visit(obj.toJSON(), seen);
				seen.pop();

				return result;
			} catch (err) {
				return "[Error]";
			}
		}
		if (Array.isArray(obj)) {
			const result = obj.map(val => this.visit(val, seen));
			seen.pop();

			return result;
		}

		const result = Object.keys(obj as Record<PropertyKey, unknown>).reduce((result, prop) => {
			result[prop] = this.visit((obj as Record<PropertyKey, unknown>)[prop], seen);

			return result;
		}, {} as Record<string, unknown>);
		seen.pop();

		return result;
	}

	static safeJSON(obj: unknown) {
		return this.visit(obj, []);
	}

	static stringify(obj: unknown) {
		return JSON.stringify(this.safeJSON(obj));
	}
}

export = SafeStringify;
