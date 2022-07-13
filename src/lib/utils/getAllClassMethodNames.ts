const reserved = new Set([
	"constructor",
	"isPrototypeOf",
	"propertyIsEnumerable",
	"toString",
	"valueOf",
	"toLocaleString"
]);

function isObjectPrototype(item: {}): item is typeof Object.prototype {
	return item.constructor.name === "Object" && Object.getPrototypeOf(item) === null;
};

function getAllClassMethodNames(instance: Record<string, unknown>, additionalReserved: Iterable<string> = []): Array<string> {
	const result = new Set<string>();
	const additionalReservedSet = new Set(additionalReserved);

	while (instance && !isObjectPrototype(instance)) {
		Object.getOwnPropertyNames(instance).forEach(p => {
			if ((typeof instance[p] == "function") && !reserved.has(p) && !additionalReservedSet.has(p)) {
				result.add(p);
			}
		});
		instance = Object.getPrototypeOf(instance);
	}

	return [...result];
};

export = getAllClassMethodNames;
