import { Event } from 'events-core/domain/models/events';
import { RedisRepositoryBase } from 'events-core/infrastructure/repositories/redis.repository.base';
import { WeeksRepositoryBase } from '../../domain/ports/weeks-repository.service';
import { AppError } from '../apps/dto-models/exceptions';

export class WeeksRedisRepository extends RedisRepositoryBase implements WeeksRepositoryBase {

	private readonly CACHE_NAME = 'WEEKS_CACHE';


	getIndexBoundaries(): Promise<{ min: number, max: number }> { 
		return this.useConection(async (connection) => {
			const min = (await connection.zRangeWithScores(this.CACHE_NAME, 0, 0));
			const max = (await connection.zRangeWithScores(this.CACHE_NAME, -1, -1));

			if (min[0] === undefined || max[0] === undefined) {
				throw new AppError(
					500,
					`Repository is corrupted - can't procced with operation`
				);
			}

			return { min: min[0].score, max: max[0].score };
		});
	}

	private parseValue(value: string): Event[] {
		return (JSON.parse(value) as any[]).map(doc => {
			doc.starts_at = new Date(doc.starts_at)
			doc.ends_at = new Date(doc.ends_at)
			return doc;
		});
	}

	find(from?: number, to?: number ): Promise<Map<number, Event[]>> {
		const [ fromKey, toKey ] = [
			from === undefined ? 0 : from,
			to === undefined ? -1 : to
		];

		console.log(`Searching keys from ${fromKey} to ${toKey}`);

		return this.useConection(async (connection) => {
			const results = await connection
				.zRangeByScoreWithScores(
					this.CACHE_NAME,
					fromKey,
					toKey
				);

			return new Map(
				results.map(({ score, value }) => 
					[ score, this.parseValue(value) ]
				)
			);
		});
	}
}
