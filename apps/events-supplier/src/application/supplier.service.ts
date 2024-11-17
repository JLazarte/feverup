import { EventsRepositoryBase } from 'events-core/domain/ports/events-repository.service';

import { EventsQuery, FormatedEvent } from '../domain/models/events';
import { EventsMapper } from './events.mapper';

export class SupplierService {
	constructor(
		private eventsMapper: EventsMapper,
		private eventsRepository: EventsRepositoryBase,
	) {}

	async supply(query: EventsQuery): Promise<FormatedEvent[]> {
		return (
			await this.eventsRepository.find(query)
		).map((event) => this.eventsMapper.map(event));
	}
}
