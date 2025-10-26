import { CronJob } from "cron";
import type * as Djs from "discord.js";
import { WeatherDescribe } from "weather-describe";
import type { EClient } from "@/client";
import { normalizeLocale } from "@/duration";
import { WeatherJobs } from "@/interface/constant";
import { processTemplateChannels } from ".";
export function setWeather(guild: Djs.Guild, client: EClient) {
	if (!client.settings.has(guild.id)) return;
	const settings = client.settings.get(guild.id);
	const weather = settings?.templates.weather;
	if (!weather) return;
	const cron = weather.cron;
	if (!cron || !weather.stopped) return;
	if (WeatherJobs.has(guild.id)) {
		const existingJob = WeatherJobs.get(guild.id);
		existingJob?.stop();
		WeatherJobs.delete(guild.id);
	}

	const stableZone = settings.settings?.zone || "utc";

	const job = new CronJob(
		cron,
		async () => {
			const liveSettings = client.settings.get(guild.id);
			// Ici, on pourrait appeler une fonction pour mettre à jour la météo
			const liveCounter = liveSettings?.templates.weather;
			if (!liveCounter) return;
			let locale = liveSettings?.settings?.language || "en-US";
			locale = normalizeLocale(locale);
			if (locale !== "en" && locale !== "fr") locale = "en";

			const wyd = new WeatherDescribe({
				lang: locale as "fr" | "en",
				timezone: stableZone,
			});
			try {
				const weatherInfo = await wyd.byCity(liveCounter.location);
				if (!weatherInfo) return;
				liveCounter.currentValue = {
					emoji: weatherInfo.emoji,
					long: weatherInfo.text.long,
					short: weatherInfo.text.short,
				};
				client.settings.set(
					guild.id,
					liveCounter.currentValue,
					"templates.weather.currentValue"
				);
				await processTemplateChannels(
					guild,
					client,
					liveSettings?.renameChannels,
					liveSettings?.textChannels
				);
			} catch (e) {
				return;
			}
		},
		null,
		true,
		stableZone // <- timezone utilisée par le CronJob lui-même
	);
	WeatherJobs.set(guild.id, job);
}
