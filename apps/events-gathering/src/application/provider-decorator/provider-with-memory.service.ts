import { Event } from 'events-core/domain/models/events';
import { EventsProviderServiceBase } from '../../domain/ports/events-provider.service';

/* Little optimization class, using a decoration patter */
export class EventsProviderWithMemoryService implements EventsProviderServiceBase {
	/* We use Set over List, cause `Set.has` is faster than `Array.contains` */
	private lastEventsId: Set<string> = new Set([]);
	private lastEvents: Map<string, Event> = new Map();

	/* We wrape the real events provider */
	constructor(private providerService: EventsProviderServiceBase) {}

	private isNewEvent(event: Event): boolean {
		const isNew = !this.lastEventsId.has(event.id)

		if (isNew) {
			return true;
		}

		//Detect any update at any value of the event
		const reference = this.lastEvents.get(event.id) as Event;
		const areEquals = Object
			.entries(event)
			.every(([ key, value ]) =>
				reference[key as keyof Event] === value
			);

		return !areEquals;
	}

	async retrieveEvents(): Promise<Event[]> {
		const events = await this.providerService.retrieveEvents();

		// Compare with reference and detects any new event
		const newEvents = events.filter((event) => this.isNewEvent(event));

		// Update reference
		this.lastEventsId = new Set(events.map((event) => event.id));
		this.lastEvents = new Map(events.map(event => [ event.id, event ]));

		return newEvents;
	}
}
