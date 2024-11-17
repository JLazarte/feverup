import { Event } from 'events-core/domain/models/events';

export interface EventsProviderServiceBase {
	retrieveEvents(): Promise<Event[]>;
}
