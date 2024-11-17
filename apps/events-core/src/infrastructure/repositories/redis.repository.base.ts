import { createClient, RedisClientType } from 'redis';

import { RepositoryBase } from 'events-core/infrastructure/repositories/repository.base';

export abstract class RedisRepositoryBase extends RepositoryBase<RedisClientType> {
	constructor(private connectionUrl: string, name: string) {
		super(name);
	}

	protected async createClient(): Promise<RedisClientType> {
		const client: RedisClientType = createClient({
			url: this.connectionUrl,
		});

		return client;
	}

	protected createConnection(): Promise<RedisClientType> {
		return this.client?.connect() as Promise<RedisClientType>;
	}

	protected async closeConnection(connection: RedisClientType): Promise<any> {
		try {
			await connection.disconnect();
		} catch (err) {
			console.error('Error during Redis disconnect:', err);
		}
	}

	protected async testConnection(connection: RedisClientType): Promise<any> {
		const ping = await connection.ping();
		console.log('Ping database: ', ping);
		return ping;
	}
}
