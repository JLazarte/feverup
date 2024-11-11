import { Axios, AxiosRequestConfig } from 'axios';

import { EventsProviderServiceBase } from '../../domain/ports/provider.service';
import { RawEvent } from 'events-core/domain/models/events';
import { EventsXMLResponseParser } from './parser/xml-events-parser';

class AxiosClient extends Axios {}

export class HttpClientEventsProviderService implements EventsProviderServiceBase {
	constructor(
		private axios: AxiosClient,
		private eventsXMLResponseParser: EventsXMLResponseParser,
	) {}

	async retrieveEvents(): Promise<RawEvent[]> {

		const config: AxiosRequestConfig = {
			url: 'https://provider.code-challenge.feverup.com/api/events',
			method: 'GET',
			responseType: 'stream',
		};

		console.log('request: ', config.url);

		return this.axios.request(config)
			.then((response: any) => this.eventsXMLResponseParser.parse(response.data))
			.catch((error: any) => {
				console.error('Error', error.message);
				console.error(error.config);
				throw error;
			});
	}
}
