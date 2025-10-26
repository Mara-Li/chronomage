import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import { type BannerSpec, eventKey } from "@/interface";
import type { EClient } from "@/client";
import { blockStartAt, labelAt, processTemplate } from "./utils";

const FUTURE_MIN_BLOCKS = 2; // nombre d'événements futurs qu'on veut toujours visibles

export async function ensureBufferForGuild(client: EClient, guildId: string) {
	const g = client.settings.get(guildId);
	if (!g || !g.schedules) return;

	const FutureMinBlocks = g.settings?.futurMinBlock ?? FUTURE_MIN_BLOCKS;

	for (const [scheduleId, s] of Object.entries(g.schedules)) {
		if (!s.active) continue;

		const zone = s.start.zone;
		const now = DateTime.now().setZone(zone);

		// 1️⃣ calcule une seule fois combien d'events futurs existent déjà
		let futureCount = Object.values(g.events ?? {}).filter((ev) => {
			if (ev.scheduleId !== scheduleId) return false;
			if (ev.status !== "created") return false;
			const evStart = DateTime.fromISO(ev.start.iso, { zone: ev.start.zone });
			return evStart > now;
		}).length;

		let k = s.nextBlockIndex;
		let changed = false;

		// 2️⃣ tant qu'on n'a pas atteint le quota, on essaie d'ajouter des blocs
		while (futureCount < FutureMinBlocks) {
			const start = blockStartAt(s, k); // début théorique du bloc k

			// si ce bloc est déjà passé ou en cours → on le compte comme "consommé"
			if (start <= now) {
				k++;
				continue;
			}

			const startIso = start.toISO()!;
			const key = eventKey(scheduleId, startIso);

			// si on l'a déjà dans g.events (même s'il vient d'une exécution précédente), on ne le recrée pas
			if (g.events[key]) {
				// il existe déjà => donc c'est un bloc futur valide => on considère qu'il fait partie du futur visible
				futureCount++;
				k++;
				continue;
			}

			// sinon, faut le créer maintenant
			const guild = client.guilds.cache.get(guildId);
			if (!guild) break; // plus de guilde dispo → on arrête ici proprement

			const end = start.plus({ milliseconds: s.lenMs });
			const label = labelAt(s, k);

			const rawDescription = s.description?.[label];

			// prépare les champs liés au type d'event discord
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

			// Sauvegarde dans la DB interne
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
			futureCount++; // on vient d'ajouter un futur event
			k++; // on avance sur le bloc suivant
		}

		// 3️⃣ Mettre à jour le pointeur du schedule si besoin
		if (k !== s.nextBlockIndex) {
			s.nextBlockIndex = k;
			changed = true;
		}

		// 4️⃣ Persister dans les settings seulement si y'a eu un changement
		if (changed) {
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
