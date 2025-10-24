import humanId from "human-id";
import { DateTime } from "luxon";
import type { EClient } from "../client";
import { parseDurationLocalized } from "../duration";
import { DEFAULT_ZONE, type EventGuildData, type Schedule } from "../interface";
import { computeInitialBlockIndex } from "./utils";
import {getSettings} from "../utils";
import * as Djs from "discord.js";

export function createSchedule(
	g: EventGuildData,
	client: EClient,
	args: {
		guildId: string;
		labels: string[]; // ["A","B"] ou ["A","A","B","B"] etc.
		blocStr: string; // "2j", "48h" (parse-duration)
		startHHMM: string; // "21:00"
		lenStr: string; // "2h"
		anchorISO?: string; // "YYYY-MM-DD"
		createdBy: string;
		zone?: string;
	}
) {
	const zone = args.zone ?? g.settings?.zone ?? DEFAULT_ZONE;
	const anchorISO = args.anchorISO ?? DateTime.now().setZone(zone).toISODate()!;
	const locale = g.settings?.language;
	const blockMs = parseDurationLocalized(args.blocStr, locale)!;
	const lenMs = parseDurationLocalized(args.lenStr, locale)!;

	const scheduleId = humanId({ separator: "-", capitalize: false });
	const s: Schedule = {
		scheduleId,
		labels: args.labels,
		blockMs,
		start: { hhmm: args.startHHMM, zone },
		lenMs,
		anchorISO,
		nextBlockIndex: computeInitialBlockIndex(anchorISO, blockMs, zone),
		active: true,
		createdBy: args.createdBy,
		createdAt: Date.now(),
	};

	g.schedules[scheduleId] = s;
	client.settings.set(args.guildId, g);
	return { scheduleId, schedule: s };
}

export function deleteSchedule(guild: Djs.Guild, scheduleId: string, client: EClient) {
  const g = getSettings(client, guild, Djs.Locale.EnglishUS);
  if (!g?.schedules[scheduleId]) return false;

  delete g.schedules[scheduleId];

  for (const k of Object.keys(g.events)) {
    const key = k as keyof typeof g.events;
    if (g.events[key].scheduleId === scheduleId) delete g.events[key];
  }

  client.settings.set(guild.id, g);
  return true;
}

export function listSchedules(guildId: string, client: EClient) {
  const g = client.settings.get(guildId);
  if (!g) return [];
  return Object.entries(g.schedules).map(([id, s]) => ({ id, s }));
}