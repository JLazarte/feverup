import { Server } from 'hyper-express';
import { SupplierService } from '../../application/supplier.service';
import { AppBase } from './app.base';

export class SupplierApp extends AppBase {
	constructor(
		private supplierService: SupplierService,
		port: number,
	) { super(port); }

	protected setup(server: Server): void {
		server.get('/events', this.defineHandler((queryParams) => {
			const query = {
				start_date: queryParams['start_date'],
				end_date: queryParams['end_date'],
			};

			return this.supplierService.supply(query);
		}));
	}
}
