import { AnyBulkWriteOperation, Document, Filter } from 'mongodb';
import { Period, Event } from 'events-core/domain/models/events';
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
			const operations = events.map(event => this.createUpsertOperation(event, 'id'));

			const {
				insertedCount,
				modifiedCount,
				upsertedCount
			} = await collection.bulkWrite(operations);

			const upsertCount = [
				insertedCount,
				modifiedCount,
				upsertedCount 
			].reduce((acc, act) => acc + act, 0);

			console.log(`Updated ${upsertCount} documents`);
		});
	}

	find(query: Period): Promise<Event[]> {
		return this.useEventsCollection((collection) => {
			console.log('Searching events, filterd by:', query);
			
			const mongoQuery: Filter<Event> = {
				starts_at: { $lte: query.ends_at } ,
				ends_at: { $gte: query.starts_at }
			}

			return collection
				.find<Event>(mongoQuery as Filter<Document>)
				.map((event: Event & Document) => {
					delete event._id;
					return event;
				})
				.toArray();
		});	
	}
}
