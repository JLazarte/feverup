import { SupplierService } from './application/supplier.service';
import { SupplierApp } from './infrastructure/apps/supplier';
import { RepositoryWithCache } from './application/repository-decorator/repository-with-cache.service';
import { WeeksRedisRepository } from './infrastructure/repositories/weeks-redis.repository';
import { DatesUtilService } from 'events-core/application/dates-util.service';


const weeksRepository = new WeeksRedisRepository(
	process.env.REDIS_URI as string,
	'weeks-redis-respository'
);

weeksRepository.initAndTest();

const eventsRepositoryWithCache = new RepositoryWithCache(
	new DatesUtilService(),
	weeksRepository,
	52 * 10,
);

const supplierService = new SupplierService(eventsRepositoryWithCache);

(new SupplierApp(
	supplierService,
	8080,
)).run();
