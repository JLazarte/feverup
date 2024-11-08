import { Event } from 'events-core/domain/models/events';
import { RepositoryBase } from '../../domain/ports/repository.service';
import { MongoEventsRepositoryBase } from 'events-core/infrastructure/repositories/mongo.repository.base';

export class MongoEventsRepository extends MongoEventsRepositoryBase implements RepositoryBase {
	async find(query: any): Promise<Event[]> {
		console.log('Searching events, filterd by:', query);

		const result: Event[] = await this.useEventsCollection((collection) => {
			return collection.find<Event>({}).toArray();
		});

		return Promise.resolve(result);
	}
}
