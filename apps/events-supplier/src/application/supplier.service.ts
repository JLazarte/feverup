import { Event } from 'events-core/domain/models/events';

import { RepositoryBase } from '../domain/ports/repository.service';

export class SupplierService {
	constructor(private eventsRepository: RepositoryBase) {}

	supply(query: any): Promise<Event[]> {
		return this.eventsRepository.find(query);
	}
}
