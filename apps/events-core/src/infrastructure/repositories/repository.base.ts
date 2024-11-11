export abstract class RepositoryBase<T> {

	protected client?: T;
	private operationCount = 0;
	private currentConnection?: Promise<T>;

	constructor(private name: string) {}

	public async initAndTest() {
		this.client = await this.createClient();
		await this.useConection((connection) => this.testConnection(connection))
	}

	protected abstract createClient(): Promise<T>;

	protected abstract createConnection(): Promise<T>;

	protected abstract closeConnection(connection: T): Promise<any>;

	protected testConnection(connection: T): Promise<any> {
		throw new Error(`method testConnection not implemented for db: ${this.name}`);
	}

	protected async useConection<R>(callback: (client: T) => Promise<R>): Promise<R> {
		this.operationCount += 1;

		if (this.currentConnection === undefined) {
			console.log('Opening new connection to: ', this.name);
			this.currentConnection = this.createConnection();
		}

		return this.currentConnection
			.then(connection => callback(connection))
			.finally(() => {
				this.operationCount -= 1;

				const shouldCloseConnection = this.currentConnection !== undefined
					&& this.operationCount === 0;

				if (shouldCloseConnection) {
					const lastConnection = this.currentConnection as Promise<T>;
					this.currentConnection = undefined;
					console.log('Closing connection to: ', this.name);
					lastConnection.then(connection => this.closeConnection(connection));
				}
		});
	}
}
