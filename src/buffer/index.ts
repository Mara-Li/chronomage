import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import type { EClient } from "@/client";
import type { BannerSpec } from "@/interface";
import { eventKey } from "../interfaces/constant";
import { blockStartAt, labelAt, processTemplate } from "./utils";

const FUTURE_MIN_BLOCKS = 2; // number of future events we always want visible

export async function ensureBufferForGuild(client: EClient, guildId: string) {
	const g = client.settings.get(guildId);
	if (!g || !g.schedules) return;

	const FutureMinBlocks = g.settings?.futurMinBlock ?? FUTURE_MIN_BLOCKS;

	for (const [scheduleId, s] of Object.entries(g.schedules)) {
		if (!s.active) continue;

		const zone = s.start.zone;
		const now = DateTime.now().setZone(zone);

		// 1️⃣ compute once how many future events already exist
		let futureCount = Object.values(g.events ?? {}).filter((ev) => {
			if (ev.scheduleId !== scheduleId) return false;
			if (ev.status !== "created") return false;
			const evStart = DateTime.fromISO(ev.start.iso, { zone: ev.start.zone });
			return evStart > now;
		}).length;

		let k = s.nextBlockIndex;
		let changed = false;

		// 2️⃣ while we haven't reached the quota, attempt to add blocks
		while (futureCount < FutureMinBlocks) {
			const start = blockStartAt(s, k); // theoretical start of block k

			// if this block is already past or ongoing → count it as "consumed"
			if (start <= now) {
				k++;
				continue;
			}

			const startIso = start.toISO()!;
			const key = eventKey(scheduleId, startIso);

			// if it's already in g.events (even if from a previous run), do not recreate it
			if (g.events[key]) {
				// it already exists => so it's a valid future block => consider it part of visible future
				futureCount++;
				k++;
				continue;
			}

			// otherwise, create it now
			const guild = client.guilds.cache.get(guildId);
			if (!guild) break; // no guild available anymore → stop here cleanly

			const end = start.plus({ milliseconds: s.lenMs });
			const label = labelAt(s, k);

			const rawDescription = s.description?.[label];

			// prepare fields related to the type of discord event
			const entityType = Number(s.locationType) as Djs.GuildScheduledEventEntityType;
			const needsChannel =
				entityType === Djs.GuildScheduledEventEntityType.Voice ||
				entityType === Djs.GuildScheduledEventEntityType.StageInstance;

			const entityMetadata =
				entityType === Djs.GuildScheduledEventEntityType.External
					? { location: s.location }
					: undefined;

			const channel = needsChannel ? s.location : undefined;

			const ev = await guild.scheduledEvents.create({
				name: await processTemplate(label, client, guild),
				scheduledStartTime: startIso,
				scheduledEndTime: end.toISO()!,
				privacyLevel: 2,
				entityType,
				entityMetadata,
				channel,
				image: await bufferBanner(s.banners?.[label]),
				description: rawDescription
					? await processTemplate(rawDescription, client, guild)
					: undefined,
			});

			// Save to internal DB
			g.events[key] = {
				scheduleId,
				discordEventId: ev.id,
				label,
				start: { iso: startIso, zone },
				lenMs: s.lenMs,
				status: "created",
				createdAt: Date.now(),
				locationSnapshot: ev.entityMetadata?.location ?? s.location ?? undefined,
				descriptionSnapshot: ev.description ?? rawDescription ?? undefined,
				locationTypeSnapshot: ev.entityType,
			};

			changed = true;
			futureCount++; // we just added a future event
			k++; // move to the next block
		}

		// 3️⃣ Update the schedule pointer if needed
		if (k !== s.nextBlockIndex) {
			s.nextBlockIndex = k;
			changed = true;
		}

		// 4️⃣ Persist into settings only if there was a change
		if (changed) {
			g.schedules[scheduleId] = s;
			client.settings.set(guildId, g);
		}
	}
}

async function bufferBanner(banner?: BannerSpec) {
	if (banner) {
		// download from Discord CDN
		const res = await fetch(banner.url);
		const arr = await res.arrayBuffer();
		return Buffer.from(arr);
	}
	return undefined;
}

export async function createEvent(
	guildId: string,
	scheduleId: string,
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction | Djs.ModalSubmitInteraction,
	ul: TFunction
) {
	setTimeout(async () => {
		try {
			console.info(`[${guildId}] Boot buffer (post-wizard)...`);
			await ensureBufferForGuild(client, guildId);
		} catch (err) {
			console.error(`[${guildId}] ensureBufferForGuild post-wizard failed:`, err);
			client.settings.delete(guildId, `schedules.${scheduleId}`);
			await interaction.followUp({
				content: ul("modals.scheduleEvent.completedError", {
					err: err instanceof Error ? err.message : String(err),
				}),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
	}, 2000);
}
