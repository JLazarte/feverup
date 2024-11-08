import { Event, RawEvent } from 'events-core/domain/models/events';
import { EventMapperBase } from '../domain/ports/events.mapper';

export class EventsMapper implements EventMapperBase {
	private splitDateAndTime(iso_datetime: string) {
		const [date, time] = iso_datetime.split('T');
		return { date, time };
	}

	map(raw: RawEvent): Event {
		const startDatetime = this.splitDateAndTime(raw.start_iso_datetime);
		const endDatetime = this.splitDateAndTime(raw.end_iso_datetime);

		return {
			id: raw.id,
			title: raw.title,
			start_date: startDatetime.date,
			start_time: startDatetime.time,
			end_date: endDatetime.date,
			end_time: endDatetime.time,
			min_price: raw.min_price,
			max_price: raw.max_price,
		};
	}
}
