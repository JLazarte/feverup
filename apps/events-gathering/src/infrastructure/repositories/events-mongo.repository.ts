import { AnyBulkWriteOperation, Document } from 'mongodb';
import { Event } from 'events-core/domain/models/events';
import { EventsQuery } from 'events-core/domain/models/query';
import { MongoRepositoryBase } from 'events-core/infrastructure/repositories/mongo.repository.base';
import { EventsRepositoryBase } from '../../domain/ports/events-repository.service';

export class EventsMongoRepository extends MongoRepositoryBase implements EventsRepositoryBase {

	private createUpsertOperation<T>(document: T, identifier: keyof T): AnyBulkWriteOperation {
		return {
			updateOne: {
				filter: { [identifier]: document[identifier] },
				update: { $set: document as Document },
				upsert: true,
			},
		};
	}

	upsert(events: Event[]): Promise<void> {
		if (events.length === 0) {
			console.log(`None documents to update`);
			return Promise.resolve();
		}

		return this.useEventsCollection(async (collection) => {
			const operations = events.map((event: Event) => this.createUpsertOperation(event, 'id'));
			const upsertManyResult = await collection.bulkWrite(operations);

			const upsertCount = [ 
				upsertManyResult.insertedCount,
				upsertManyResult.modifiedCount,
				upsertManyResult.upsertedCount
			].reduce((acc, act) => acc + act, 0);

			console.log(`Updated ${upsertCount} documents`);
		});
	}

	find(query: EventsQuery): Promise<Event[]> {
		return this.useEventsCollection((collection) => {
			console.log('Searching events, filterd by:', query);
			return collection
				.find<Event>({
					start_date: { $lte: query.end_date } ,
					end_date: { $gte: query.start_date } }
				).map((event: Event & Document) => {
					delete event._id;
					return event;
				})
				.toArray();
		});	
	}
}
