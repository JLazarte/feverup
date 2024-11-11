import { Event } from 'events-core/domain/models/events';
import { EventsRepositoryBase as RepositoryBase } from 'events-core/domain/ports/events-repository.service';

export interface EventsRepositoryBase extends RepositoryBase {
	upsert(events: Event[]): Promise<void>;
}
