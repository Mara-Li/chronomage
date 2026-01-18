import { CronJob } from "cron";
import type * as Djs from "discord.js";
import type { EClient } from "@/client";
import { CountJobs } from "@/interface/constant";
import { processTemplateChannels } from "./index.js";
export function setCount(guild: Djs.Guild, client: EClient) {
	const settings = client.settings.get(guild.id);
	const counter = settings?.templates.count;
	if (!counter) return;
	const cron = counter.cron;
	if (!cron || counter.stopped) return;
	//stop any existing job
	if (CountJobs.has(guild.id)) {
		const existingJob = CountJobs.get(guild.id);
		existingJob?.stop();
		CountJobs.delete(guild.id);
	}
	const job = new CronJob(
		cron,
		async () => {
			console.log("Count cron job triggered");
			const liveCounter = settings?.templates.count;
			if (!liveCounter) return;

			const currentValue = +(liveCounter.currentValue + liveCounter.step).toFixed(
				liveCounter.decimal
			);
			client.settings.set(guild.id, currentValue, "templates.count.currentValue");
			//send message if channel is set
			const liveSettings = client.settings.get(guild.id);
			await processTemplateChannels(
				guild,
				client,
				liveSettings?.renameChannels,
				liveSettings?.textChannels
			);
		},
		null,
		true,
		settings.settings?.zone
	);
	CountJobs.set(guild.id, job);
	job.start();
}
