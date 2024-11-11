import { createClient, RedisClientType } from 'redis';

import { RepositoryBase } from 'events-core/infrastructure/repositories/repository.base';

export abstract class RedisRepositoryBase extends RepositoryBase<RedisClientType> {
	constructor(private connectionUrl: string, name: string) {
		super(name);
	}

	protected async createClient(): Promise<RedisClientType> {
		return createClient({
			url: this.connectionUrl
		});
	}

	protected createConnection(): Promise<RedisClientType> {
		return this.client?.connect() as Promise<RedisClientType>;
	}

	protected closeConnection(connection: RedisClientType): Promise<any> {
		return connection.quit();
	}

	protected async testConnection(connection: RedisClientType): Promise<any> {
        const ping = await connection.ping();
		console.log('Ping database: ', ping);
		return ping;
	}

}
