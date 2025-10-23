import { CronJob } from "cron";
import type * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "../client";
import { jobs } from "../interface";
export function setDate(guild: Djs.Guild, client: EClient) {
	//stop any existing job
	if (jobs.has(guild.id)) {
		const existingJob = jobs.get(guild.id);
		existingJob?.stop();
		jobs.delete(guild.id);
	}
	const settings = client.settings.get(guild.id);
	const counter = settings?.templates.date;
	if (!counter) return;
	const cron = counter.cron;
	if (!cron) return;
	const job = new CronJob(
		cron,
		() => {
			//calculate the new date value with Luxon
			const date = DateTime.fromISO(counter.currentValue, {
				zone: settings?.settings?.zone || "utc",
			});
			//the step is already in ms
			const currentValue = date.plus(counter.step).toISO();
			//update the database
			client.settings.set(guild.id, currentValue, "templates.date.currentValue");
		},
		null,
		true,
		settings.settings?.zone
	);
	jobs.set(guild.id, job);
	job.start();
}
