import type * as Djs from "discord.js";
import type { EClient } from "@/client";
import { type BannerSpec, DEFAULT_ZONE, type Templates } from "@/interface";

export function defaultTemplate(): Templates {
	return {
		date: {
			format: "f",
			timezone: "UTC",
			cron: "0 0 * * *",
			start: new Date().toISOString(),
			step: 86400000,
			currentValue: new Date().toISOString(),
			computeAtStart: false,
		},
		count: {
			start: 1,
			step: 1,
			decimal: 4,
			cron: "0 0 * * *",
			currentValue: 0,
			computeAtStart: false,
		},
		weather: { location: "London", computeAtStart: true },
	};
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
		settings: {
			language: guild.preferredLocale ?? interactionLocale,
			futurMinBlock: 2,
			zone: DEFAULT_ZONE,
		},
	});
}

export function getBannerHash(
	interaction: Djs.ModalSubmitInteraction
): BannerSpec | undefined {
	const banner = interaction.fields.getUploadedFiles("image", false);
	if (!banner) return;
	const file = banner.first();
	if (!file) return;
	return {
		url: file.url,
		contentType: file.contentType,
	};
}
