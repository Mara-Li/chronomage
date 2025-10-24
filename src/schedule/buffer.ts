import * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "../client";
import { type BannerSpec, DEFAULT_BUFFER_DAYS, eventKey } from "../interface";
import { blockStartAt, labelAt, processTemplate } from "./utils";

export async function ensureBufferForGuild(client: EClient, guildId: string) {
	const g = client.settings.get(guildId);
	if (!g || !g.schedules) return;
	console.log(`[${guildId}] Ensuring event buffer...`);
	const bufferDays = g.settings?.bufferDays ?? DEFAULT_BUFFER_DAYS;
	for (const [scheduleId, s] of Object.entries(g.schedules)) {
		if (!s.active) continue;

		const now = DateTime.now().setZone(s.start.zone);
		const horizon = now.plus({ days: bufferDays });

		let k = s.nextBlockIndex;
		let changed = false;

		while (true) {
			const start = blockStartAt(s, k);
			if (start > horizon) break;

			const startIso = start.toISO()!;
			const key = eventKey(scheduleId, startIso);

			if (!g.events[key]) {
				const end = start.plus({ milliseconds: s.lenMs });
				const label = labelAt(s, k);
				const guild = client.guilds.cache.get(guildId);
				if (!guild) break;

				const description = s.description?.[label];

				const entityMetadata =
					s.locationType === Djs.GuildScheduledEventEntityType.External
						? { location: s.location }
						: undefined;
				const channel =
					s.locationType !== Djs.GuildScheduledEventEntityType.External
						? s.location
						: undefined;

				console.log(
					`[${guildId}] Creating event for schedule ${scheduleId} at ${startIso} (label: ${label})`
				);
				const ev = await guild.scheduledEvents.create({
					name: await processTemplate(label, client, guild),
					scheduledStartTime: startIso,
					scheduledEndTime: end.toISO()!,
					privacyLevel: 2,
					entityType: s.locationType,
					entityMetadata,
					channel,
					image: await bufferBanner(s.banners?.[label]),
					description: description
						? await processTemplate(description, client, guild)
						: undefined,
				});

				g.events[key] = {
					scheduleId,
					discordEventId: ev.id,
					label,
					start: { iso: startIso, zone: s.start.zone },
					lenMs: s.lenMs,
					status: "created",
					createdAt: Date.now(),
					locationSnapshot: ev.entityMetadata?.location ?? s.location,
					descriptionSnapshot: ev.description ?? description,
					locationTypeSnapshot: ev.entityType,
				};
				changed = true;
			}

			k += 1;
		}

		if (changed) {
			s.nextBlockIndex = k; // avance le pointeur
			g.schedules[scheduleId] = s;
			client.settings.set(guildId, g);
		}
	}
}

async function bufferBanner(banner?: BannerSpec) {
	if (banner) {
		// download depuis CDN Discord
		const res = await fetch(banner.url);
		const arr = await res.arrayBuffer();
		return Buffer.from(arr);
	}
	return undefined;
}
