import { Event } from 'events-core/domain/models/events';

export interface RepositoryBase {
	save(events: Event[]): Promise<void>;
}
