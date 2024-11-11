import { MongoClient, Collection, MongoClientOptions } from 'mongodb';
import { RepositoryBase } from './repository.base';

export abstract class MongoRepositoryBase extends RepositoryBase<MongoClient> {
	
	constructor(
		private database: string,
		private connectionUrl: string,
		private mongoOptions: MongoClientOptions,
		name: string
	) {
		super(name)
	}

	protected async createClient(): Promise<MongoClient> {
		return new MongoClient(this.connectionUrl, this.mongoOptions);
	};

	protected createConnection(): Promise<MongoClient> {
		return this.client?.connect() as Promise<MongoClient>;
	}

	protected closeConnection(connection: MongoClient): Promise<void> {
		// return connection.close();
		// Allow mongo client handle the idle connections;
		return Promise.resolve()
	}

	protected async testConnection(connection: MongoClient): Promise<any> {
		const ping = await connection.db().command({ ping: 1 });
		console.log('Ping database: ', ping);
		return ping;
	}

	protected async useConection<R>(callback: (client: MongoClient) => Promise<R>): Promise<R> {
		return callback(await this.createConnection());
	}

	protected useEventsCollection<R>(
		callback: (collection: Collection) => Promise<R>,
	): Promise<R> {
		return this.useConection((client) => {
			const eventsCollection = client.db(this.database).collection('events');
			return callback(eventsCollection);
		});
	}
}
