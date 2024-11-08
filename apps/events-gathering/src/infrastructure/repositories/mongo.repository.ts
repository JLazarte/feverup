import { AnyBulkWriteOperation } from 'mongodb';
import { Event } from 'events-core/domain/models/events';
import { RepositoryBase } from '../../domain/ports/repository.service';
import { MongoEventsRepositoryBase } from 'events-core/infrastructure/repositories/mongo.repository.base';

export class MongoEventsRepository extends MongoEventsRepositoryBase implements RepositoryBase {
	private createUpsertOperation<T>(document: T, identifier: keyof T): AnyBulkWriteOperation {
		return {
			updateOne: {
				filter: { [identifier]: document[identifier] },
				update: { $set: document as Document },
				upsert: true,
			},
		};
	}

	async save(events: Event[]): Promise<void> {
		if (events.length === 0) {
			console.log(`None documents updated`);
			return Promise.resolve()
		}

		const upsertManyResult = await this.useEventsCollection((collection) => {
			const operations = events.map((event: Event) => this.createUpsertOperation(event, 'id'));
			return collection.bulkWrite(operations);
		});

		const upsertCount = upsertManyResult.insertedCount + upsertManyResult.modifiedCount;

		console.log(`Updated ${upsertCount} documents`);

		return Promise.resolve();
	}
}
