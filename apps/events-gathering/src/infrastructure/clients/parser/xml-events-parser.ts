import NodeExpat from 'node-expat';
import { RawEvent } from 'events-core/domain/models/events';
import { BaseEvent, Event, Zone } from '../dto-models/event-provider.dto';

type ElementTag = 'base_event' | 'event' | 'zone';

type ElementHandler = {
	[key in ElementTag]: (attr: any) => void;
};

export class EventsXMLResponseParser {
	private defineParser(eventList: RawEvent[]): NodeExpat.Parser {
		const parser = new NodeExpat.Parser();

		let currentBaseEvent: BaseEvent;
		let currentEvent: Event;
		let eventPrices: { min_price: number, max_price: number } | undefined;

		const handlers: ElementHandler = {
			base_event: (attr: BaseEvent) => {
				currentBaseEvent = {
					base_event_id: attr.base_event_id,
					title: attr.title,
					sell_mode: attr.sell_mode,
				};
			},
			event: (attr: Event) => {
				currentEvent = {
					event_id: attr.event_id,
					event_start_date: attr.event_start_date,
					event_end_date: attr.event_end_date,
				};
			},
			zone: (attr: Zone) => {
				const price = parseFloat(attr.price);
				eventPrices = {
					min_price: eventPrices === undefined
						? price : Math.min(eventPrices.min_price, price),
					max_price: eventPrices === undefined
						? price : Math.max(eventPrices.max_price, price),
				};
			},
		};

		parser.on('startElement', (name: string, attr: any) => {
			if (name in handlers) {
				handlers[name as ElementTag](attr);
			}
		});

		parser.on('endElement', (name) => {
			if (name === 'event') {
				eventList.push({
					id: `${currentBaseEvent.base_event_id}::${currentEvent.event_id}`,
					title: currentBaseEvent.title,
					sell_type: currentBaseEvent.sell_mode,
					start_iso_datetime: currentEvent.event_start_date,
					end_iso_datetime: currentEvent.event_end_date,
					min_price: eventPrices?.min_price || -1,
					max_price: eventPrices?.max_price || -1,
				});

				eventPrices = undefined;
			}
		});

		return parser;
	}

	parse(dataBuffer: NodeJS.ReadableStream): Promise<RawEvent[]> {
		return new Promise((resolve, reject) => {
			try {
				const events: RawEvent[] = [];
				const parser = this.defineParser(events);

				parser.on('end', () => {
					console.log('Finished parsing XML, Parsed items:', events.length);
					resolve(events);
				});

				parser.on('error', (error: Error) => {
					console.error('Parsing error:', error);
					reject(error);
				});

				dataBuffer.on('end', () => {
					parser.end();
				});

				dataBuffer.on('data', (chunk) => {
					parser.write(chunk);
				});
			} catch (error) {
				reject(error);
			}
		});
	}
}
