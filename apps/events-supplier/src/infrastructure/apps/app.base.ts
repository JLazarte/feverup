import Express, { Request, Response } from 'express';
import { Query } from 'express-serve-static-core';

import { ErrorAppResponse, SuccessAppResponse } from './dto-models/server.dto';

export abstract class AppBase {
	protected server?: Express.Express;

	constructor(private port: number) {}

	protected abstract setup(server: Express.Express): void;

	private init() {
		this.server = Express();

		this.setup(this.server);

		this.server.listen(this.port, () => {
			console.log(`Example app listening on port ${this.port}`);
		});
	}

	protected defineHandler<T extends object>(
		dataSupplier: (params: Query) => T | Promise<T>,
	): Express.RequestHandler {
		return async (req: Request, res: Response) => {
			try {
				const response: SuccessAppResponse<T> = { data: await dataSupplier(req.query) };
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
