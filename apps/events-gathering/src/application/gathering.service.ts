import { EventsProviderServiceBase } from '../domain/ports/provider.service';
import { RepositoryBase } from '../domain/ports/repository.service';
import { EventsMapper } from './events.mapper';

export class GatheringService {
	constructor(
		private providerService: EventsProviderServiceBase,
		private eventsMapper: EventsMapper,
		private eventsRepository: RepositoryBase,
	) {}

	async collect(): Promise<any[]> {
		const rawEvents = await this.providerService.retrieveEvents();
		const events = rawEvents.map((event) => this.eventsMapper.map(event));
		await this.eventsRepository.save(events);
		return events;
	}
}
