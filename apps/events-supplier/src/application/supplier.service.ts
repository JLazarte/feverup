import { Event } from 'events-core/domain/models/events';

import { EventsRepositoryBase } from 'events-core/domain/ports/events-repository.service';
import { EventsQuery } from 'events-core/domain/models/query';

export class SupplierService {
	constructor(private eventsRepository: EventsRepositoryBase) {}

	supply(query: EventsQuery): Promise<Event[]> {
		return this.eventsRepository.find(query);
	}
}
