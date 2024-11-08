import { MongoEventsRepository } from './infrastructure/repositories/mongo.repository';
import { SupplierService } from './application/supplier.service';
import { SupplierApp } from './infrastructure/apps/supplier';

(new SupplierApp(
	new SupplierService(
		new MongoEventsRepository(
			'challenge-db',
			process.env.MONGO_URI as string
		),
	),
	8080,
)).run();
