import { EventsQuery, Event } from '../models/events';

export interface EventsRepositoryBase {

	// This method should not await a promise or will cause perfomances issues;
	find(query: EventsQuery): Promise<Event[]>;
}
