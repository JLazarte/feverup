import { Event } from 'events-core/domain/models/events';
import { RedisRepositoryBase } from 'events-core/infrastructure/repositories/redis.repository.base';
import { WeeksRepositoryBase } from '../../domain/ports/weeks-repository.service';

export class WeeksRedisRepository extends RedisRepositoryBase implements WeeksRepositoryBase {

	private readonly CACHE_NAME = 'WEEKS_CACHE';

	private getKey(week: number) {
		return `${this.CACHE_NAME}::${week}`
	}

	find(week: number): Promise<Event[] | undefined> {
		console.log('Searching week', week);

		return this.useConection(async (connection) => {
			const document = await connection.get(this.getKey(week));
			return document == null ? undefined : JSON.parse(document) as Event[];
		})
	}
}
