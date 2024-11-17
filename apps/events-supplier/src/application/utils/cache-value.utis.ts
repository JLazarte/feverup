export class CacheValueUtils<T> {
	private readonly NS_PER_MS = 1000 * 1000;

	private cache: Promise<T> | undefined;
	private ttl: bigint | undefined;

	constructor(
		private supplier: () => Promise<T>,
		private timeToLiveInMs: number
	){}

	private getTime(): bigint {
		return process.hrtime.bigint(); 
	}

	// This method should not await a promise or will cause perfomances issues;
	public get(): Promise<T> {
		if (this.ttl === undefined) {
			this.ttl = this.getTime();
			this.cache = this.supplier();

		} else {
			const currentTTL = Number(this.ttl - this.getTime()) / this.NS_PER_MS
			
			if (currentTTL > this.timeToLiveInMs) {
				this.ttl = this.getTime();
				this.cache = this.supplier();
			}
		}

		return this.cache as Promise<T>;
	}
}
