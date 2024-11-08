import { scheduleJob } from 'node-schedule';

import { GatheringService } from '../../application/gathering.service';

export class GatheringApp {
	constructor(
		private gatheringService: GatheringService,
		private cronExpresion: string,
	) { }

	public run(): void {
		scheduleJob(this.cronExpresion, async () => {
			console.log('GATHERING');
			await this.gatheringService.collect();
		});
	}
}
