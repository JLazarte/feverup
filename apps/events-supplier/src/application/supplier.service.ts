import { Event } from 'events-core/domain/models/events';

import { RepositoryBase } from '../domain/ports/repository.service';
import { EventsQuery } from '../domain/models/query';

export class SupplierService {
	constructor(private eventsRepository: RepositoryBase) {}

	supply(query: EventsQuery): Promise<Event[]> {
		return this.eventsRepository.find(query);
	}
}
