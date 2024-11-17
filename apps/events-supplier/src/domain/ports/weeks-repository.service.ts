import { Event } from 'events-core/domain/models/events';

export interface WeeksRepositoryBase {
	getIndexBoundaries(): Promise<{ min: number, max: number }>

	find(from?: number, to?: number): Promise<Map<number, Event[]>>
}
