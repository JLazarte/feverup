import { MongoEventsRepository } from './infrastructure/repositories/mongo.repository';
import { SupplierService } from './application/supplier.service';
import { SupplierApp } from './infrastructure/apps/supplier';
import { RepositoryWithMemory } from './application/repository-decorator/repository-with-memory.service';

(new SupplierApp(
	new SupplierService(
		new RepositoryWithMemory(
			new MongoEventsRepository(
				'challenge-db',
				process.env.MONGO_URI as string
			),
			1000
		)
	),
	8080,
)).run();
