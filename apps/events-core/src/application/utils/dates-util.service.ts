import { Period } from '../../domain/models/events';

export class DatesUtilService {
	private readonly MS_PER_DAY: number = 24 * 60 * 60 * 1000;

	private readonly MS_PER_WEEK: number = 7 * this.MS_PER_DAY;

	private getWeekFromDate(date: Date) {
		return Math.floor((date.getTime()) / this.MS_PER_WEEK);
	}

	private getWeekRangeFromPeriod(period: Period): number[] {
		const startWeek = this.getWeekFromDate(period.starts_at);
		const endWeek = this.getWeekFromDate(period.ends_at);

		return this.createWeeksRange(startWeek, endWeek);
	}

	public extractWeeksFromItems(items: Period[]) {
		const weeks = items
			.map((period) => this.getWeekRangeFromPeriod(period))
			.flatMap((list) => list)
			.reduce((acc, act) => {
				if (!acc.has(act)) {
					acc.add(act);
				}

				return acc;
			}, new Set<number>())
			.values();

		return Array.from(weeks);
	}

	public getDateAndTimeFormated(datetime: Date) : { date: string; time: string } {
		const [date, time] = datetime.toISOString().split('T');
		return { date, time: time.split('.')[0] };
	}

	public createWeeksRange(from: number, to: number): number[] {
		return new Array(to - from + 1).fill(0).map((_, idx: number) => from + idx);
	}

	public mapDatesToWeeks(dates: Array<Date | undefined>): Array<number | undefined> {
		return dates.map((date) => (date === undefined ? undefined : this.getWeekFromDate(date)));
	}

	public getPeriodFromWeek(weekNumber: number): Period {
		const startDate = new Date(weekNumber * this.MS_PER_WEEK);
		const endsDate = new Date(startDate.getTime() + this.MS_PER_WEEK - 1);

		return {
			starts_at: startDate,
			ends_at: endsDate,
		};
	}
}
