import { Event } from '../models/events';
import { EventsQuery } from '../models/query';

export interface EventsRepositoryBase {
	
	// This method should not await a promise or will cause perfomances issues;
	find(query: EventsQuery): Promise<Event[]>;
}
