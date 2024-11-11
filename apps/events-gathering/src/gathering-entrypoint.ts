import { Axios } from 'axios';
import { MongoClientOptions, ReadConcernLevel } from 'mongodb';

import { EventsMapper } from './application/events.mapper';
import { GatheringApp } from './infrastructure/apps/gathering';
import { GatheringService } from './application/gathering.service';
import { EventsMongoRepository } from './infrastructure/repositories/events-mongo.repository';
import { EventsXMLResponseParser } from './infrastructure/clients/parser/xml-events-parser';
import { HttpClientEventsProviderService } from './infrastructure/clients/http-provider.service';
import { FilteredEventsProviderService } from './application/provider-decorator/filtered-provider.service';
import { EventsProviderWithMemoryService } from './application/provider-decorator/provider-with-memory.service';
import { WeeksRedisRepository } from './infrastructure/repositories/weeks-redis.repository';
import { DatesUtilService } from 'events-core/application/dates-util.service';

const EACH_5_MINUTES = '*/5 * * * *';

const axiosClient = new Axios({});

const providerService = new EventsProviderWithMemoryService(
	new FilteredEventsProviderService(
		new HttpClientEventsProviderService(
			axiosClient,
			new EventsXMLResponseParser(),
		),
	),
);

const weeksRedisRepository = new WeeksRedisRepository(
	process.env.REDIS_URI as string,
	'weeks-redis-repository'
);

const mongoConfig: MongoClientOptions = {
	readConcern: { level: ReadConcernLevel.local },
	minPoolSize: 5
};

const eventsMongoRepository = new EventsMongoRepository(
	'challenge-db',
	process.env.MONGO_URI as string,
	mongoConfig,
	'events-mongo-repository'
);

eventsMongoRepository.initAndTest();
weeksRedisRepository.initAndTest();

const gatheringService = new GatheringService(
	weeksRedisRepository,
	eventsMongoRepository,
	providerService,
	new EventsMapper(),
	new DatesUtilService()
);

gatheringService.collect();

const app = new GatheringApp(
	gatheringService,
	process.env.GATHERING_CRON_EXPRESION || EACH_5_MINUTES,
);

app.run();
