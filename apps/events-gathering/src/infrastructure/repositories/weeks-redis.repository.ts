import { Event } from 'events-core/domain/models/events';
import { RedisRepositoryBase } from 'events-core/infrastructure/repositories/redis.repository.base';
import { WeeksRepositoryBase } from '../../domain/ports/weeks-repository.service';

export class WeeksRedisRepository extends RedisRepositoryBase implements WeeksRepositoryBase {

	private readonly CACHE_NAME = 'WEEKS_CACHE';

	private getKey(week: number) {
		return `${this.CACHE_NAME}::${week}`
	}

	upsert(week: number, events: Event[]): Promise<any> {
		return this.useConection(async (connection) => {
			console.log('Update week', week, 'with n elements', events.length);
			const value = JSON.stringify(events);
			await connection.set(this.getKey(week), value);
		})
	}
}
