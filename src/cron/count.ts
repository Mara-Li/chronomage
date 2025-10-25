import type { EClient } from "client";
import { CronJob } from "cron";
import type * as Djs from "discord.js";
import { CountJobs } from "interface";
export function setCount(guild: Djs.Guild, client: EClient) {
	const settings = client.settings.get(guild.id);
	const counter = settings?.templates.count;
	if (!counter) return;
	const cron = counter.cron;
	if (!cron) return;
	const job = new CronJob(
		cron,
		() => {
			const currentValue = +(counter.currentValue + counter.step).toFixed(
				counter.decimal
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
