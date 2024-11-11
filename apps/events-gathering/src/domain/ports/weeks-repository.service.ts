import { Event } from 'events-core/domain/models/events';

export interface WeeksRepositoryBase {
	upsert(week: number, events: Event[]): Promise<any | void>;
}
