import { Server, Request, Response, MiddlewareHandler } from 'hyper-express'
import { ErrorAppResponse, SuccessAppResponse } from './dto-models/server.dto';

export abstract class AppBase {
	protected server?: Server;

	constructor(private port: number) {}

	protected abstract setup(server: any): void;

	private init() {
		this.server = new Server();

		this.setup(this.server);

		this.server
			.listen(this.port)
			.then(() => {
				console.log(`Example app listening on port ${this.port}`);
			});
	}

	protected defineHandler<T extends object>(
		dataSupplier: (params: { [key: string]: string }) => T | Promise<T>,
	): (req: Request, res: Response) => void {
		return async (req: Request, res: Response) => {
			try {
				const response: SuccessAppResponse<T> = { data: await dataSupplier(req.query_parameters) };
				res.json(response);

			} catch (err) {
				const error = err as Error;
				console.error(error.message, error);

				const response: ErrorAppResponse = { error: { code: 'code', message: error.message } };
				res.status(500).json(response);
			}
		};
	}

	run() {
		this.init();
	}
}
