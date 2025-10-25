import { CronJob } from "cron";
import type * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "../client";
import { DateJobs } from "../interface";
export function setDate(guild: Djs.Guild, client: EClient) {
	//stop any existing job
	if (DateJobs.has(guild.id)) {
		const existingJob = DateJobs.get(guild.id);
		existingJob?.stop();
		DateJobs.delete(guild.id);
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
			let currentValue = counter.currentValue;
			if (!currentValue) {
				const zone = counter.timezone || settings?.settings?.zone || "utc";
				currentValue =
					DateTime.fromISO(counter.start, { zone }).toISO() ??
					DateTime.fromISO(counter.start).toISO() ??
					DateTime.now().toISO();
			}
			const date = DateTime.fromISO(currentValue, {
				zone: counter.timezone || settings?.settings?.zone || "utc",
			});
			//the step is already in ms
			const newCurrent = date.plus(counter.step).toISO();
			//update the database
			client.settings.set(guild.id, newCurrent, "templates.date.currentValue");
		},
		null,
		true,
		settings.settings?.zone
	);
	DateJobs.set(guild.id, job);
	job.start();
}
