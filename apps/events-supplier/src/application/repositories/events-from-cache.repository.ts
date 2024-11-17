import { EventsQuery, Event } from 'events-core/domain/models/events';
import { DatesUtilService } from 'events-core/application/utils/dates-util.service';
import { EventsRepositoryBase } from 'events-core/domain/ports/events-repository.service';
import { WeeksRepositoryBase } from '../../domain/ports/weeks-repository.service';
import { CacheValueUtils } from '../utils/cache-value.utis';
import { WeekCacheService, WeekRange } from './weeks-cache.service';

type Boundries = { min: number, max: number } ;
export class EventsFromCacheRepository implements EventsRepositoryBase {

	private readonly MS_ON_1_MINUTES = 60 * 1000;
	private readonly MS_ON_5_MINUTES = 5 * this.MS_ON_1_MINUTES;
	private boundriesCache: CacheValueUtils<Boundries>;

	constructor(
		private datesUtil: DatesUtilService,
		private weeksRepository: WeeksRepositoryBase,
		private weekCacheService: WeekCacheService
	) {

		this.boundriesCache = new CacheValueUtils(
			() => this.weeksRepository.getIndexBoundaries(),
			this.MS_ON_5_MINUTES
		)
	}

	private async getWeeksQuery(query: EventsQuery): Promise<WeekRange> {
		const indexBoundries = await this.boundriesCache.get();

		const [ minWeek, maxWeek ] = this.datesUtil.mapDatesToWeeks([
			query.starts_at,
			query.ends_at
		]);

		return {
			from: minWeek === undefined ? indexBoundries.min : minWeek,
			to: maxWeek === undefined ? indexBoundries.max : maxWeek
		};
	}

	private findMissingGaps(
		rangesToFind: Array<WeekRange>
	): Array<Promise<Map<number, Event[]>>> {
		return rangesToFind.map(({ from, to }) => {
			const findTask = this.weeksRepository.find(from, to);

			this.datesUtil
				.createWeeksRange(from, to)
				.forEach(week => {
					const weekTask = findTask.then(resultMap => 
						(resultMap.get(week) || []) as Event[]
					);

					this.weekCacheService.set(week, weekTask);
				});

			return findTask;
		});
	}

	async find(query: EventsQuery): Promise<Event[]> {
		
		// Translate query dates to weeks
		const weeksQuery = await this.getWeeksQuery(query);

		// Calculate all the find queris need to fill the gaps in the cache memory
		const findQueries = this.weekCacheService.findRangeGaps(weeksQuery);			

		// Await until the week cache is filled with the missing gaps
		await Promise.all(this.findMissingGaps(findQueries));

		// Join events and remove the ones that doesn't match with the query
		const events = await this.weekCacheService.joinAndFilterEvents(query, weeksQuery);

		// Log info only if a findQueries was executed
		if (findQueries.length > 0) {
			console.log('query', weeksQuery, findQueries, 'result qty', events.length);
		}

		return events;
	}
}
