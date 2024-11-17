import { SupplierService } from './application/supplier.service';
import { SupplierApp } from './infrastructure/apps/supplier';
import { EventsFromCacheRepository } from './application/repositories/events-from-cache.repository';
import { WeeksRedisRepository } from './infrastructure/repositories/weeks-redis.repository';
import { DatesUtilService } from 'events-core/application/utils/dates-util.service';
import { EventsMapper } from './application/events.mapper';
import { WeekCacheService } from './application/repositories/weeks-cache.service';


const weeksRepository = new WeeksRedisRepository(
	process.env.REDIS_URI as string,
	'weeks-redis-respository'
);

weeksRepository.initAndTest();

const dateUtils = new DatesUtilService();

const weekCacheService = new WeekCacheService(
	dateUtils,
	52 * 10
);

const eventsRepositoryWithCache = new EventsFromCacheRepository(
	dateUtils,
	weeksRepository,
	weekCacheService
);

(new SupplierApp(
	new SupplierService(
		new EventsMapper(dateUtils),
		eventsRepositoryWithCache
	),
	8080,
)).run();
