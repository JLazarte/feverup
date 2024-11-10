import { Event } from 'events-core/domain/models/events';
import { EventsQuery } from '../models/query';

export interface RepositoryBase {
	find(query: EventsQuery): Promise<Event[]>;
}
