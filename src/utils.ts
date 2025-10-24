import type * as Djs from "discord.js";
import type { EClient } from "./client";
import type { EventGuildData, Templates } from "./interface";
import { ln } from "./localization";

export function defaultTemplate(): Templates {
	return {
		date: {
			format: "f",
			timezone: "UTC",
			cron: "0 0 * * *",
			start: new Date().toISOString(),
			step: 1,
			currentValue: new Date().toISOString(),
		},
		count: { start: 1, step: 1, decimal: 4, cron: "0 0 * * *", currentValue: 0 },
		weather: { location: "London" },
	};
}

export function tFn(
	settings: EventGuildData,
	guild: Djs.Guild,
	interactionLocale: Djs.Locale
) {
	return ln(settings?.settings?.language ?? guild.preferredLocale ?? interactionLocale);
}

export function getSettings(
	client: EClient,
	guild: Djs.Guild,
	interactionLocale: Djs.Locale
) {
	return client.settings.ensure(guild!.id, {
		templates: defaultTemplate(),
		events: {},
		schedules: {},
		settings: { language: guild.preferredLocale ?? interactionLocale },
	});
}
