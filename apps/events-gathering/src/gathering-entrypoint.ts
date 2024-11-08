import { Axios } from 'axios';

import { EventsMapper } from './application/events.mapper';
import { GatheringApp } from './infrastructure/apps/gathering';
import { GatheringService } from './application/gathering.service';
import { MongoEventsRepository } from './infrastructure/repositories/mongo.repository';
import { EventsXMLResponseParser } from './infrastructure/clients/parser/xml-events-parser';
import { HttpClientEventsProviderService } from './infrastructure/clients/http-provider.service';
import { FilteredEventsProviderService } from './application/provider-decorator/filtered-provider.service';
import { EventsProviderWithMemoryService } from './application/provider-decorator/provider-with-memory.service';

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

(new GatheringApp(
	new GatheringService(
		providerService,
		new EventsMapper(),
		new MongoEventsRepository(
			'challenge-db',
			process.env.MONGO_URI as string
		)
	),
	process.env.GATHERING_CRON_EXPRESION || EACH_5_MINUTES,
)).run();
