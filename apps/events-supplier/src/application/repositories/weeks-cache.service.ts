import { LRUCache } from 'lru-cache';

import { EventsQuery, Event } from 'events-core/domain/models/events';
import { DatesUtilService } from 'events-core/application/utils/dates-util.service';

export type WeekRange = { from: number, to: number } ;

export class WeekCacheService {
	private readonly MS_ON_1_MINUTES = 60 * 1000;
	private readonly MS_ON_5_MINUTES = 5 * this.MS_ON_1_MINUTES;
	private weekCache: LRUCache<number, Promise<Event[]>>;

	constructor(
		private datesUtil: DatesUtilService,
		maxCacheElements: number
	) {
		this.weekCache = new LRUCache<number, Promise<Event[]>>({
			max: maxCacheElements,
			ttl: this.MS_ON_5_MINUTES
		});
	}

	public set(week: number, val: Promise<Event[]>) {
		this.weekCache.set(week, val);
	}

	private getWeeksOnCache({ from, to }: WeekRange) {
		return Array.from(this.weekCache.entries())
			.filter(([key]) => key >= from && key <= to)
			.filter(([key]) => {
				// ignore elements with less than 1 min of time remaining
				const ttl = this.weekCache.getRemainingTTL(key);
				return ttl > this.MS_ON_1_MINUTES; // to avoid last second missing values
			}).sort(([keyA], [keyB]) => keyA - keyB);
	}

	public findRangeGaps(weeksQuery: WeekRange): Array<WeekRange> {
		return this.getWeeksOnCache(weeksQuery)
			.reduce((acc, [ week ]) => {
				const { from, to } = acc.pop() as WeekRange;

				const before = { from, to: week - 1 };
				const after = { from: week + 1, to };

				// if is less, doesn't make sense to search
				if (before.from < before.to) {
					acc.push(before);
				}

				// if is less, doesn't make sense to search
				if (after.from <= after.to) {
					acc.push(after);
				}

				return acc;
			}, [weeksQuery])
	}

	private joinEvents(eventsByWeek: Array<Event[]>): Event[] {
		const events = eventsByWeek
			.flatMap(list => list)
			.reduce((acc, act) => {
				if (!acc.has(act.id)) {
					acc.set(act.id, act)
				};
				return acc;
			}, new Map<string, Event>())
			.values();

		return Array.from(events)
	}

	public async joinAndFilterEvents(query: EventsQuery, weeksQuery: WeekRange): Promise<Event[]> {
		// Calculate all the weeks involved
		const weeksRange = this.datesUtil.createWeeksRange(weeksQuery.from, weeksQuery.to);

		// Retrieve the information of each week from cache
		const eventsByWeek = (await Promise.all(
			weeksRange.map(week => (this.weekCache.get(week) || []))
		));

		const firstWeek = eventsByWeek.slice(0,1)?.[0] || [];
		const lastWeek = eventsByWeek.slice(-1)?.[0] || [];

		// Comparing the dates YYYY-MM-DD to avoid append elemments outside of the original query
		const overflowEvents = new Set<string>([
			...firstWeek.filter(event => query.starts_at ? 
				event.ends_at <= query.starts_at :
				false
			),
			...lastWeek.filter(event => query.ends_at ? 
				event.starts_at >= query.ends_at :
				false
			)
		].map(event => event.id));

		return this
			.joinEvents(eventsByWeek)
			.filter(event => !overflowEvents.has(event.id));
	}
}
