import { Server } from 'hyper-express';

import { EventsQuery } from 'events-core/domain/models/events';
import { SupplierService } from '../../application/supplier.service';
import { PreconditionFailedError } from './dto-models/exceptions';
import { AppBase } from './app.base';

export class SupplierApp extends AppBase {
	constructor(
		private supplierService: SupplierService,
		port: number,
	) { super(port); }

	private validateDate(query: EventsQuery, target: keyof EventsQuery): string | undefined {
		const date = query[target];

		const isValid = date === undefined || (
			date instanceof Date &&
			!isNaN(date.getTime() as any)
		);

		return isValid? undefined : `${target} is invalid date`;
	}

	private validateQuery(query: EventsQuery): Array<string> {
		return [
			this.validateDate(query, 'starts_at'),
			this.validateDate(query, 'ends_at')
		].filter(el => el !== undefined) as Array<string>;
	}

	protected setup(server: Server): void {
		server.get('/events', this.defineHandler(async (queryParams) => {
			const query: EventsQuery = {
				starts_at: queryParams['starts_at'] ? new Date(queryParams['starts_at']) : undefined,
				ends_at: queryParams['ends_at'] ? new Date(queryParams['ends_at']) : undefined,
			};

			const validationErrors = this.validateQuery(query);

			if (validationErrors.length > 0) {
				throw new PreconditionFailedError(
					`Query is not valid - Reasons: ${validationErrors}`
				);
			}

			return {
				events: await this.supplierService.supply(query)
			};
		}));
	}
}
