import { Axios } from 'axios';
import { Event } from 'events-core/domain/models/events';
import { EventsProviderServiceBase } from '../../domain/ports/events-provider.service';
import { EventsXMLResponseParser } from './parser/xml-events-parser';

class AxiosClient extends Axios {}

export class HttpClientEventsProviderService implements EventsProviderServiceBase {
	constructor(
		private eventProviderURL: string,
		private axios: AxiosClient,
		private eventsXMLResponseParser: EventsXMLResponseParser,
	) {}

	async retrieveEvents(): Promise<Event[]> {
		console.log('request: ', this.eventProviderURL);

		return this.axios.request({
			url: this.eventProviderURL,
			method: 'GET',
			responseType: 'stream',
		}).then((response: any) => 
			this.eventsXMLResponseParser.parse(response.data)
		).catch((error: any) => {
			console.error('Error', error.message);
			console.error(error.config);
			throw error;
		});
	}
}
