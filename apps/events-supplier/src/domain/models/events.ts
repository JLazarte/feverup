export interface EventsQuery {
	starts_at: Date | undefined,
	ends_at: Date | undefined
}

export interface FormatedEvent {
	id: string,
	title: string,
	start_date: string, // "2024-11-01",
	start_time: string, // "22:38:19",
	end_date: string, // "2024-11-01",
	end_time: string, // "14:45:15",
	min_price: number,
	max_price: number
}