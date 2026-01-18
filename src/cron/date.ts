import { CronJob } from "cron";
import type * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "@/client";
import { DateJobs } from "@/interface/constant";
import { processTemplateChannels } from ".";
export function setDate(guild: Djs.Guild, client: EClient) {
	//stop any existing job
	const settings = client.settings.get(guild.id);
	const counter = settings?.templates.date;
	if (!counter) return;
	const cron = counter.cron;
	if (!cron || counter.stopped) return;
	if (DateJobs.has(guild.id)) {
		const existingJob = DateJobs.get(guild.id);
		existingJob?.stop();
		DateJobs.delete(guild.id);
	}

	const stableZone = counter.timezone || settings?.settings?.zone || "utc";
	const job = new CronJob(
		cron,
		async () => {
			const liveSettings = client.settings.get(guild.id);
			const liveCounter = liveSettings?.templates?.date;

			// currentValue in DB, otherwise fallback
			let currentValue = liveCounter?.currentValue;
			if (!currentValue) {
				// initial value: start > otherwise now
				currentValue =
					(counter.start &&
						(DateTime.fromISO(counter.start, { zone: stableZone }).toISO() ||
							DateTime.fromISO(counter.start).toISO())) ||
					DateTime.now().setZone(stableZone).toISO() ||
					DateTime.now().toISO();
			}

			// Parse + avance
			const date = DateTime.fromISO(currentValue, { zone: stableZone });

			// NOTE: counter.step is expected to be a Duration-like (ms)
			// If it's an object like { days: 4 }, adjust here.
			const newCurrent = date.plus(counter.step).toISO();

			// Persiste la nouvelle valeur
			client.settings.set(guild.id, newCurrent, "templates.date.currentValue");
			await processTemplateChannels(
				guild,
				client,
				liveSettings?.renameChannels,
				liveSettings?.textChannels
			);
		},
		null,
		true,
		stableZone // <- timezone utilisée par le CronJob lui-même
	);
	DateJobs.set(guild.id, job);
	job.start();
}
