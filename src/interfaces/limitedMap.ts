export class ErrorLimitReached extends Error {
	constructor(maxSize: number) {
		super(`Limite de ${maxSize} entrées atteinte`);
		this.name = "ErrorLimitReached";
	}
}

export class LimitedMap<K, V> extends Map<K, V> {
	constructor(private readonly maxSize: number) {
		super();
	}
	override set(key: K, value: V) {
		if (this.size >= this.maxSize && !this.has(key))
			throw new ErrorLimitReached(this.maxSize);
		return super.set(key, value);
	}
}
