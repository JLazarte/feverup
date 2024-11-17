export interface Event extends Period {
	id: string,
	title: string,
	sell_type: string,
	min_price: number,
	max_price: number
}

export interface Period extends EventsQuery {
	starts_at: Date,
	ends_at: Date
}

export interface EventsQuery {
	starts_at: Date | undefined,
	ends_at: Date | undefined
}
