import { Event } from 'events-core/domain/models/events';
import { DatesUtilService } from 'events-core/application/dates-util.service';

import { EventsProviderServiceBase } from '../domain/ports/provider.service';
import { EventsRepositoryBase } from '../domain/ports/events-repository.service';
import { EventsMapper } from './events.mapper';
import { WeeksRepositoryBase } from '../domain/ports/weeks-repository.service';

export class GatheringService {
	constructor(
		private weeksRepository: WeeksRepositoryBase,
		private eventsRepository: EventsRepositoryBase,
		private providerService: EventsProviderServiceBase,
		private eventsMapper: EventsMapper,
		private datesUtil: DatesUtilService,
	) {}

	private extractWeeksFromEvents(events: Event[]) {
		const weeks = events
			.map((event) => this.datesUtil.getWeekRangeFromPeriod(event))
			.flatMap((list) => list)
			.reduce((acc, act) => {
				if (!acc.has(act)) {
					acc.add(act);
				}

				return acc;
			}, new Set<number>())
			.values();

		return Array.from(weeks);
	}

	private updateWeeksRepository(weeks: number[]): Promise<any>[] {
		return weeks.map(async (week) => {
			const query = this.datesUtil.getDateRangeFromWeek(week);
			const events = await this.eventsRepository.find(query);
			return this.weeksRepository.upsert(week, events);
		});
	}

	async collect(): Promise<any[]> {
		const rawEvents = await this.providerService.retrieveEvents();
		
		const events = rawEvents.map((event) => this.eventsMapper.map(event));

		await this.eventsRepository.upsert(events);

		const weeks = this.extractWeeksFromEvents(events);

		await Promise.all(this.updateWeeksRepository(weeks));

		console.log('Weeks updated:', weeks);

		return events;
	}
}
