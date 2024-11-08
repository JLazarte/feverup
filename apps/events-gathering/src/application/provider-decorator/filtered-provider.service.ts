import { RawEvent } from 'events-core/domain/models/events';
import { EventsProviderServiceBase } from '../../domain/ports/provider.service';

/*  Using a decoration patter for filter only online events and discard invalid ones */
export class FilteredEventsProviderService implements EventsProviderServiceBase {
	/* We wrape the real events provider */
	constructor(private providerService: EventsProviderServiceBase) {}

	/* Filter events, return true to keep the event, return false to discard it */
	private filterEvent(event: RawEvent): boolean {
		return event.sell_type === 'online' && event.min_price >= 0 && event.max_price >= 0;
	}

	async retrieveEvents(): Promise<RawEvent[]> {
		return (await this.providerService.retrieveEvents())
			.filter((event) => this.filterEvent(event));
	}
}
