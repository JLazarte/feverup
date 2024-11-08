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

	retrieveEvents(): Promise<RawEvent[]> {
		console.log('HttpClientEventsProviderService');

		const config: AxiosRequestConfig = {
			url: 'https://provider.code-challenge.feverup.com/api/events',
			method: 'GET',
			responseType: 'stream',
		};

		console.log('request: ', config.url);

		return this.axios.request(config)
			.then((response: any) => this.eventsXMLResponseParser.parse(response.data))
			.catch((error: any) => {
				if (error.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					console.error(error.response.data);
					console.error(error.response.status);
					console.error(error.response.headers);
				} else if (error.request) {
					// The request was made but no response was received
					// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
					// http.ClientRequest in node.js
					console.error(error.request);
				} else {
					// Something happened in setting up the request that triggered an Error
					console.error('Error', error.message);
				}
				console.error(error.config);

				throw error;
			});
	}
}
