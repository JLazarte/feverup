import { Period } from '../domain/models/events';

export class DatesUtilService {
	private readonly MS_PER_DAY: number = 24 * 60 * 60 * 1000;

	private readonly MS_ON_WEEK: number = 7 * this.MS_PER_DAY;

	private readonly MS_OND_SIX_DAYS: number = 6 * this.MS_PER_DAY;

	public formatDate(date: Date): string {
		return date.toISOString().split('T')[0];
	}

	public createWeeksRange(from: number, to: number): number[] {
		return new Array(to - from + 1).fill(0).map((_, idx: number) => from + idx);
	}

	public getWeekFromDate(date: string) {
		return Math.floor((new Date(date).getTime()) / this.MS_ON_WEEK);
	}

	public getWeekRangeFromPeriod(period: Period): number[] {
		const startWeek = this.getWeekFromDate(period.start_date);
		const endWeek = this.getWeekFromDate(period.end_date);

		return this.createWeeksRange(startWeek, endWeek);
	}

	public getDateRangeFromWeek(weekNumber: number): Period {
		const startDate = new Date(weekNumber * this.MS_ON_WEEK);
		const endDate = new Date(startDate.getTime() + this.MS_OND_SIX_DAYS);

		return {
			start_date: this.formatDate(startDate),
			end_date: this.formatDate(endDate),
		};
	}
}
