import * as Djs from "discord.js";
import humanId from "human-id";
import { DateTime } from "luxon";
import type { EClient } from "@/client";
import { DEFAULT_ZONE, type EventGuildData, type Schedule } from "@/interface";
import { getSettings } from "@/utils";
import { computeInitialBlockIndex } from "./utils";

export function createSchedule(
	g: EventGuildData,
	args: {
		guildId: string;
		labels: string[]; // ["A","B"] ou ["A","A","B","B"] etc.
		blocMs: number; // ms
		startHHMM: string; // "21:00"
		lenMs: number; // ms
		anchorISO?: string; // "YYYY-MM-DD"
		createdBy: string;
		zone?: string;
		location: string;
		locationType: Djs.GuildScheduledEventEntityType;
	}
) {
	const zone = args.zone ?? g.settings?.zone ?? DEFAULT_ZONE;
	const anchorISO = args.anchorISO ?? DateTime.now().setZone(zone).toISODate()!;
	const blockMs = args.blocMs;
	const lenMs = args.lenMs;

	const scheduleId = humanId({ separator: "-", capitalize: false });
	const s: Schedule = {
		scheduleId,
		labels: args.labels,
		blockMs,
		start: { hhmm: args.startHHMM, zone },
		lenMs,
		anchorISO,
		nextBlockIndex: computeInitialBlockIndex(anchorISO, blockMs, zone, args.startHHMM),
		active: true,
		createdBy: args.createdBy,
		createdAt: Date.now(),
		location: args.location,
		locationType: args.locationType,
	};

	g.schedules[scheduleId] = s;

	return { scheduleId, schedule: s };
}

export async function deleteSchedule(
	guild: Djs.Guild,
	scheduleId: string,
	client: EClient
) {
	const g = getSettings(client, guild, Djs.Locale.EnglishUS);
	if (!g?.schedules[scheduleId]) return false;

	delete g.schedules[scheduleId];

	for (const k of Object.keys(g.events)) {
		const key = k as keyof typeof g.events;
		const event = g.events[key];
		// Ne toucher qu'aux événements qui appartiennent au scheduleId ciblé
		if (event.scheduleId !== scheduleId) continue;

		// Si l'événement a été créé sur Discord, supprimer uniquement celui-ci
		if (event.discordEventId) {
			try {
				// fetch() pour s'assurer d'obtenir l'événement même s'il n'est pas en cache
				const ev = await guild.scheduledEvents.fetch(event.discordEventId);
				await ev?.delete();
			} catch (err) {
				//pass
			}
		}

		// Supprimer l'event des données locales
		delete g.events[key];
	}

	client.settings.set(guild.id, g);
	return true;
}

export async function cancelAll(guild: Djs.Guild, client: EClient) {
	const allEventsInDiscord = await guild.scheduledEvents.fetch();
	const promises = allEventsInDiscord.map((ev) => ev.delete());
	await Promise.all(promises);
	const g = getSettings(client, guild, Djs.Locale.EnglishUS);
	if (!g) return;
	g.schedules = {};
	g.events = {};
	client.settings.set(guild.id, g);
}

export function listSchedules(guildId: string, client: EClient) {
	const g = client.settings.get(guildId);
	if (!g) return [];
	return Object.entries(g.schedules).map(([id, s]) => ({ id, s }));
}

export function setScheduleActive(
	guildId: string,
	scheduleId: string,
	active: boolean,
	client: EClient
) {
	const g = client.settings.get(guildId);
	if (!g) return false;
	const s = g.schedules[scheduleId];
	if (!s) return false;
	s.active = active;
	client.settings.set(guildId, g);
	return true;
}

export function listUpcomingEventsForGuild(guildId: string, client: EClient, limit = 5) {
	const g = client.settings.get(guildId);
	if (!g) return [];
	return Object.values(g.events)
		.filter((e) => e.status === "created")
		.sort((a, b) => a.start.iso.localeCompare(b.start.iso))
		.slice(0, limit);
}
