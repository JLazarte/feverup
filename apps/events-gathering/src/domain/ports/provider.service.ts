import { RawEvent } from 'events-core/domain/models/events';

export interface EventsProviderServiceBase {
	retrieveEvents(): Promise<RawEvent[]>;
}
