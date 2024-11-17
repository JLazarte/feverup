import { Event } from 'events-core/domain/models/events';
import { RedisRepositoryBase } from 'events-core/infrastructure/repositories/redis.repository.base';
import { WeeksRepositoryBase } from '../../domain/ports/weeks-repository.service';

export class WeeksRedisRepository extends RedisRepositoryBase implements WeeksRepositoryBase {

	private readonly CACHE_NAME = 'WEEKS_CACHE';

	upsert(week: number, events: Event[]): Promise<any> {
		return this.useConection(async (connection) => {
			console.log('Update week', week, 'with n elements', events.length);

			const [ previusValue ] = await connection
				.zRangeByScore(this.CACHE_NAME, week, week);

			if (previusValue) {
				await connection.zRemRangeByScore(this.CACHE_NAME, week, week);
			}

			return await connection.zAdd(
				this.CACHE_NAME,
				{ score: week, value: JSON.stringify(events)}
			);
		})
	}
}
