import { Event } from 'events-core/domain/models/events';

export interface WeeksRepositoryBase {
//  findAll(): Promise<{ week: number, events: Event[]} | undefined>;

	find(week: number): Promise<Event[] | undefined>;
}
