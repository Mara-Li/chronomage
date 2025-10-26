import { CronJob } from "cron";
import type * as Djs from "discord.js";
import { DateTime } from "luxon";
import { DateJobs } from "@/interface";
import type { EClient } from "@/client";
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
	const stableZone = counter.timezone || settings?.settings?.zone || "utc";
	const job = new CronJob(
		cron,
		() => {
			const liveSettings = client.settings.get(guild.id);
			const liveCounter = liveSettings?.templates?.date;

			// currentValue actuel en base, sinon fallback
			let currentValue = liveCounter?.currentValue;
			if (!currentValue) {
				// init de départ : start > sinon now
				currentValue =
					(counter.start &&
						(DateTime.fromISO(counter.start, { zone: stableZone }).toISO() ||
							DateTime.fromISO(counter.start).toISO())) ||
					DateTime.now().setZone(stableZone).toISO() ||
					DateTime.now().toISO();
			}

			// Parse + avance
			const date = DateTime.fromISO(currentValue, { zone: stableZone });

			// NOTE: counter.step est censé être un Duration-like (ms)
			// Si c'est bien un objet { days: 4 } etc., ajuste ici.
			const newCurrent = date.plus(counter.step).toISO();

			// Persiste la nouvelle valeur
			client.settings.set(guild.id, newCurrent, "templates.date.currentValue");
		},
		null,
		true,
		stableZone // <- timezone utilisée par le CronJob lui-même
	);
	DateJobs.set(guild.id, job);
	job.start();
}
