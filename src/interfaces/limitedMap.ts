export class LimitedMap<K, V> extends Map<K, V> {
	constructor(private readonly maxSize: number) {
		super();
	}
	override set(key: K, value: V) {
		if (this.size >= this.maxSize && !this.has(key))
			throw new Error(`Limite de ${this.maxSize} entrées atteinte`);
		return super.set(key, value);
	}
}
