export function getMethods<T>(obj: T) {
	return Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
		.filter((name) => name !== 'constructor' && typeof obj[name as keyof T] === 'function')
		.map((name) => name as keyof T)
}
