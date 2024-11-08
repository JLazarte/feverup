import { RawEvent } from 'events-core/domain/models/events';
import { EventsProviderServiceBase } from '../../domain/ports/provider.service';

/* Little optimization class, using a decoration patter */
export class EventsProviderWithMemoryService implements EventsProviderServiceBase {
	/* We use Set over List, cause `Set.has` is faster than `Array.contains` */
	private lastEventsId: Set<number> = new Set([]);

	/* We wrape the real events provider */
	constructor(private providerService: EventsProviderServiceBase) {}

	async retrieveEvents(): Promise<RawEvent[]> {
		const events = await this.providerService.retrieveEvents();

		const newEvents = events.filter((event) => !this.lastEventsId.has(Number(event.id)));

		this.lastEventsId = new Set(events.map((event) => Number(event.id)));

		return newEvents;
	}
}
