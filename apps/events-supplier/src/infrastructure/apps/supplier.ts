import Express from 'express';
import { Query } from 'express-serve-static-core';

import { SupplierService } from '../../application/supplier.service';
import { AppBase } from './app.base';

export class SupplierApp extends AppBase {
	constructor(
		private supplierService: SupplierService,
		port: number,
	) { super(port); }

	private getStringParam(map: Query, param: string) {
		return map[param] !== undefined && typeof map[param] === 'string' ? map[param] : undefined;
	}

	protected setup(server: Express.Express): void {
		server.get('/events', this.defineHandler((params) => {
			const query = {
				start_date: this.getStringParam(params, 'start_date'),
				end_date: this.getStringParam(params, 'end_date'),
			};

			return this.supplierService.supply(query);
		}));
	}
}
