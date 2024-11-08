import { Event, RawEvent } from 'events-core/domain/models/events';

export interface EventMapperBase {
	map(raw: RawEvent): Event;
}
