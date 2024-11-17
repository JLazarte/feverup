import { Server, Request, Response } from 'hyper-express'
import { ErrorAppResponse, SuccessAppResponse } from './dto-models/server-response';
import { AppError } from './dto-models/exceptions';

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

	private isAppError(err: any): err is AppError {
		return err !== undefined && err.code !== undefined;
	}

	protected defineHandler<T extends object>(
		dataSupplier: (params: { [key: string]: string }) => T | Promise<T>,
	): (req: Request, res: Response) => void {
		return async (req: Request, res: Response) => {
			try {
				const response: SuccessAppResponse<T> = { data: await dataSupplier(req.query_parameters) };
				res.json(response);

			} catch (err: any) {
				const error: AppError = this.isAppError(err) ? err
					: new AppError(500, err?.message || String(err));

				console.error(error.message, error);

				const response: ErrorAppResponse = {
					error: { code: error.code , message: error.message }
				};

				res.status(error.statusCode).json(response);
			}
		};
	}

	run() {
		this.init();
	}
}
