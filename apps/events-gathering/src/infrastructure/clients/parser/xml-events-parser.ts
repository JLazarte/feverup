import NodeExpat from 'node-expat';
import { Event } from 'events-core/domain/models/events';
import { BaseEventTag, EventTag, ZoneTag } from '../dto-models/event-provider.dto';

type ElementTag = 'base_event' | 'event' | 'zone';

type ElementHandler = {
	[key in ElementTag]: (attr: any) => void;
};

export class EventsXMLResponseParser {
	private defineParser(eventList: Event[]): NodeExpat.Parser {
		const parser = new NodeExpat.Parser();

		let currentBaseEvent: BaseEventTag;
		let currentEvent: EventTag;
		let eventPrices: { min_price: number, max_price: number } | undefined;

		const handlers: ElementHandler = {
			base_event: (attr: BaseEventTag) => {
				currentBaseEvent = {
					base_event_id: attr.base_event_id,
					title: attr.title,
					sell_mode: attr.sell_mode,
				};
			},
			event: (attr: EventTag) => {
				currentEvent = {
					event_id: attr.event_id,
					event_start_date: attr.event_start_date,
					event_end_date: attr.event_end_date,
				};
			},
			zone: (attr: ZoneTag) => {
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
					starts_at: new Date(`${currentEvent.event_start_date}Z`),
					ends_at: new Date(`${currentEvent.event_end_date}Z`),
					min_price: eventPrices?.min_price || -1,
					max_price: eventPrices?.max_price || -1,
				});

				eventPrices = undefined;
			}
		});

		return parser;
	}

	parse(dataBuffer: NodeJS.ReadableStream): Promise<Event[]> {
		return new Promise((resolve, reject) => {
			try {
				const events: Event[] = [];
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
