export interface RawEvent {
	id: string,
	title: string,
	sell_type: string,
	start_iso_datetime: string,
	end_iso_datetime: string,
	min_price: number,
	max_price: number
}

export interface Event {
	id: string,
	title: string,
	start_date: string, // "2024-11-01",
	start_time: string, // "22:38:19",
	end_date: string, // "2024-11-01",
	end_time: string, // "14:45:15",
	min_price: number,
	max_price: number
}
