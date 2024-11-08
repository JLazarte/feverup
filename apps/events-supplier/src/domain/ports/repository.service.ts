import { Event } from 'events-core/domain/models/events';

export interface RepositoryBase {
	find(query: any): Promise<Event[]>;
}
