import { CronJob } from "cron";
import type * as Djs from "discord.js";
import type { EClient } from "@/client";
import { CountJobs } from "../interfaces/constant";
export function setCount(guild: Djs.Guild, client: EClient) {
	const settings = client.settings.get(guild.id);
	const counter = settings?.templates.count;
	if (!counter) return;
	const cron = counter.cron;
	if (!cron) return;
	//stop any existing job
	if (CountJobs.has(guild.id)) {
		const existingJob = CountJobs.get(guild.id);
		existingJob?.stop();
		CountJobs.delete(guild.id);
	}
	const job = new CronJob(
		cron,
		() => {
			const liveCounter = settings?.templates.count;
			if (!liveCounter) return;

			const currentValue = +(liveCounter.currentValue + liveCounter.step).toFixed(
				liveCounter.decimal
			);
			client.settings.set(guild.id, currentValue, "templates.count.currentValue");
		},
		null,
		true,
		settings.settings?.zone
	);
	CountJobs.set(guild.id, job);
	job.start();
}
