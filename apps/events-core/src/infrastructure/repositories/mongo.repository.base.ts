import { MongoClient, Collection } from 'mongodb';

export abstract class MongoEventsRepositoryBase {
	constructor(
		private database: string,
		private connectionUrl: string,
	) {}

	protected async openConection<R>(callback: (client: MongoClient) => Promise<R>): Promise<R> {
		let client: MongoClient | undefined;
		let result: R;

		try {
			client = new MongoClient(this.connectionUrl);
			result = await callback(client);
		} finally {
			await (client?.close?.());
		}

		return result;
	}

	protected async useEventsCollection<R>(
		callback: (collection: Collection) => Promise<R>,
	): Promise<R> {
		return this.openConection((client) => {
			const eventsCollection = client.db(this.database).collection('events');
			return callback(eventsCollection);
		});
	}
}
