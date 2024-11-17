import { DatesUtilService } from 'events-core/application/utils/dates-util.service';

import { EventsProviderServiceBase } from '../domain/ports/events-provider.service';
import { EventsRepositoryBase } from '../domain/ports/events-repository.service';
import { WeeksRepositoryBase } from '../domain/ports/weeks-repository.service';

export class GatheringService {
	constructor(
		private weeksRepository: WeeksRepositoryBase,
		private eventsRepository: EventsRepositoryBase,
		private providerService: EventsProviderServiceBase,
		private datesUtil: DatesUtilService,
	) {}

	private updateWeeksRepository(weeks: number[]): Promise<any>[] {
		return weeks.map(async (week) => {
			const periodQuery = this.datesUtil.getPeriodFromWeek(week);
			const events = await this.eventsRepository.find(periodQuery);
			return this.weeksRepository.upsert(week, events);
		});
	}

	async collect(): Promise<any[]> {
		// Retrieve events
		const events = await this.providerService.retrieveEvents();

		// Update events database
		await this.eventsRepository.upsert(events);

		const weeks = this.datesUtil.extractWeeksFromItems(events);

		// Update weeks cache
		const results = await Promise.all(this.updateWeeksRepository(weeks));

		console.log('Weeks updated:', weeks, ' => ', results.join(' - '));

		return events;
	}
}
