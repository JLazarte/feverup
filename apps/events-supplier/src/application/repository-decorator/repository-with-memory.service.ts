import { Event } from 'events-core/domain/models/events';
import { RepositoryBase } from '../../domain/ports/repository.service';
import { LRUCache } from 'lru-cache';
import { EventsQuery } from '../../domain/models/query';


/* Little optimization class, using a decoration patter */
export class RepositoryWithMemory implements RepositoryBase {

	private readonly MS_PER_DAY: number = 24 * 60 * 60 * 1000 ;
	private readonly MS_ON_WEEK: number = 7 * this.MS_PER_DAY;
	private readonly MS_OND_SIX_DAYS: number = 6 * this.MS_PER_DAY;

	private lastestQueries: LRUCache<string, Promise<Event[]>>;

	/* We wrape the real events provider */
	constructor(private repository: RepositoryBase, maxMemory: number) {
		this.lastestQueries = new LRUCache({
			max: maxMemory,
			updateAgeOnGet: true,
			ttl: 5 * 60 * 1000
		})
	}

	private formatDate(date: Date): string {
		return date.toISOString().split("T")[0];
	}

	private createRange(from: number, to: number): number[] {
		return new Array(to - from + 1).fill(0).map((_, idx: number) => from + idx);
	}

	private getWeeFromDate(date: string) {
		return Math.floor((new Date(date).getTime()) / this.MS_ON_WEEK);
	}

	private getDateRangeFromWeek(weekNumber: number): EventsQuery {
		const epochDate = new Date("1970-01-01");

		const startDate = new Date(epochDate.getTime() + (weekNumber * this.MS_ON_WEEK));
		const endDate = new Date(startDate.getTime() + this.MS_OND_SIX_DAYS);
	  		
		return {
		  start_date: this.formatDate(startDate),
		  end_date: this.formatDate(endDate)
		};
	}

	private getKey(query: EventsQuery): string {
		return `${query.start_date}::${query.end_date}`;
	}

	private async retrieveEvents(query: EventsQuery): Promise<Event[]> {
		const key = this.getKey(query);
		
		if (!this.lastestQueries.has(key)) {
			this.lastestQueries.set(key, this.repository.find(query));
		}

		return await (this.lastestQueries.get(key) as Promise<Event[]>);
	}

	async find(query: EventsQuery): Promise<Event[]> {
		const key = this.getKey(query);
		if (this.lastestQueries.has(key)) {
			return await (this.lastestQueries.get(key) as Promise<Event[]>);
		}

		const startWeek = this.getWeeFromDate(query.start_date);
		const endWeek = this.getWeeFromDate(query.end_date);

		const weeksRange = this.createRange(startWeek, endWeek);

		const eventsByWeek: Array<Event[]> = await Promise.all(
			weeksRange.map((week) => {
				const queryForWeek = this.getDateRangeFromWeek(week);
				return this.retrieveEvents(queryForWeek);
			})
		)

		const firstWeek = eventsByWeek.slice(0,1)[0];
		const lastWeek = eventsByWeek.slice(-1)[0];

		/* Comparing the dates YYYY-MM-DD to avoid append elemments outside of the original query */
		const overflowEvents = new Set(
			[
				...(firstWeek?.filter?.(event => event.start_date < query.start_date) || []),
				...(lastWeek?.filter?.(event => event.end_date > query.end_date) || [])
			].map(event => event.id)
		);

		const events = Array.from(
			new Map(eventsByWeek.flatMap((list) => list).map((event) => [event.id, event])
		).values());

		const result = events.filter(event => !overflowEvents.has(event.id))

		this.lastestQueries.set(key, Promise.resolve(result));

		return result;
	}
}
