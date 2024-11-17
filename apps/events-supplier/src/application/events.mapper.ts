import { Event } from 'events-core/domain/models/events';
import { DatesUtilService } from 'events-core/application/utils/dates-util.service';
import { FormatedEvent } from '../domain/models/events';

export class EventsMapper {
	constructor(private dateUtils: DatesUtilService) {}

	map(raw: Event): FormatedEvent {
		const start = this.dateUtils.getDateAndTimeFormated(raw.starts_at);
		const end = this.dateUtils.getDateAndTimeFormated(raw.ends_at);

		return {
			id: raw.id,
			title: raw.title,
			start_date: start.date,
			start_time: start.time,
			end_date: end.date,
			end_time: end.time,
			min_price: raw.min_price,
			max_price: raw.max_price,
		};
	}
}
