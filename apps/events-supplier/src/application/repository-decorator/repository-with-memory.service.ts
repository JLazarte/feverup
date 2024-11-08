import { Event } from 'events-core/domain/models/events';
import { RepositoryBase } from '../../domain/ports/repository.service';
import { LRUCache } from 'lru-cache';


/* Little optimization class, using a decoration patter */
export class RepositoryWithMemory implements RepositoryBase {
	/* We use Set over List, cause `Set.has` is faster than `Array.contains` */
	private lastestQueries: LRUCache<string, Event[]>;

	/* We wrape the real events provider */
	constructor(private repository: RepositoryBase, maxMemory: number) {
		this.lastestQueries = new LRUCache({
			max: maxMemory,
			updateAgeOnGet: true,
			ttl: 5 * 60 * 1000
		})
	}
	async find(query: any): Promise<Event[]> {
		const key = JSON.stringify(query);
		
		if (!this.lastestQueries.has(key)) {
			const events = await this.repository.find(query);

			this.lastestQueries.set(key, events);
		}

		return this.lastestQueries.get(key) as Event[];
	}
}
