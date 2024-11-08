export interface BaseEvent {
	base_event_id: string
	sell_mode: string
	title: string
}

export interface Event {
	event_id: string
	event_start_date: string
	event_end_date: string
}

export interface Zone {
	price: string
}
