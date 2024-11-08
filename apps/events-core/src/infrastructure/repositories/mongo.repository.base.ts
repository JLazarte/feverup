import { MongoClient, Collection } from 'mongodb';

export abstract class MongoEventsRepositoryBase {

	private operationCount = 0;
	private currentClientConnection?: MongoClient;

	constructor(
		private database: string,
		private connectionUrl: string,
	) {}

	private createNewConnection(): MongoClient {
		console.log("Open new connection to the database");
		return new MongoClient(this.connectionUrl);
	}

	protected async openConection<R>(callback: (client: MongoClient) => Promise<R>): Promise<R> {
		let result: R;

		this.operationCount = this.operationCount + 1;

		try {
			this.currentClientConnection = this.currentClientConnection || this.createNewConnection();
			result = await callback(this.currentClientConnection);

		} finally {
			this.operationCount = this.operationCount - 1;

			const shouldCloseConnection = this.currentClientConnection !== undefined &&
				this.operationCount === 0;

			if (shouldCloseConnection) {
				const connection = this.currentClientConnection as MongoClient;
				this.currentClientConnection = undefined;
				console.log("Closing connection to the database");
				await (connection.close());
				
			}
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
