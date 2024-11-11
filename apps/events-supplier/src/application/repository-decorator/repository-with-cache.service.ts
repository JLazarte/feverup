import { LRUCache } from 'lru-cache';

import { Event } from 'events-core/domain/models/events';
import { EventsQuery } from 'events-core/domain/models/query';
import { DatesUtilService } from 'events-core/application/dates-util.service';
import { EventsRepositoryBase } from 'events-core/domain/ports/events-repository.service';
import { WeeksRepositoryBase } from '../../domain/ports/weeks-repository.service';


/* Little optimization class, using a decoration patter */
export class RepositoryWithCache implements EventsRepositoryBase {

	private readonly MS_ON_5_MINUTES = 5 * 60 * 1000;

	private lastestWeeks: LRUCache<number, Promise<Event[] | undefined>>;

	/* We wrape the real events provider */
	constructor(
		private datesUtil: DatesUtilService,
		private weeksRepository: WeeksRepositoryBase,
		maxMemoryForWeeks: number
	) {
		this.lastestWeeks = new LRUCache({
			max: maxMemoryForWeeks,
			updateAgeOnGet: true,
			ttl: this.MS_ON_5_MINUTES
		});
	}

	// This method should not await a promise or will cause perfomances issues;
	private retrieveWeekEvents(week: number): Promise<Event[] | undefined> {
		if (!this.lastestWeeks.has(week)) {
			const task = this.weeksRepository.find(week);
			this.lastestWeeks.set(week, task);

			return task;
		}

		return this.lastestWeeks.get(week) as Promise<Event[]>;
	}

	private isEventList(result: Event[] | undefined): result is Event[] {
		return result !== undefined;
	}

	private joinEvents(eventsByWeek: Array<Event[]>): Event[] {
		const events = eventsByWeek
			.flatMap(list => list)
			.reduce((acc: Map<string, Event>, act: Event) => {
				if (!acc.has(act.id)) {
					acc.set(act.id, act)
				};
				return acc;
			}, new Map<string, Event>())
			.values();

		return Array.from(events)
	}

	async find(query: EventsQuery): Promise<Event[]> {
		const weeksRange = this.datesUtil.getWeekRangeFromPeriod(query);

		const searches = weeksRange.map((week) => this.retrieveWeekEvents(week));

		const eventsByWeek: Array<Event[]> = (
			await Promise.all(searches)
		).filter(list => this.isEventList(list)) as Array<Event[]>;

		const firstWeek = eventsByWeek.slice(0,1)?.[0] || [];
		const lastWeek = eventsByWeek.slice(-1)?.[0] || [];

		/* Comparing the dates YYYY-MM-DD to avoid append elemments outside of the original query */
		const overflowEvents = new Set<string>(
			[
				...(firstWeek.filter(event => event.start_date < query.start_date)),
				...(lastWeek.filter(event => event.end_date > query.end_date))
			].map(event => event.id)
		);

		const events = this
			.joinEvents(eventsByWeek)
			.filter((event: Event) => !overflowEvents.has(event.id));

		return events;
	}
}
