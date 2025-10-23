import type { Locale } from "discord.js";

export interface Templates {
	date: { format: string; cron: string; start: string; step: number; timezone: string };
	count: { start: number; step: number; decimal: number; cron: string };
	weather: { location: string; cron: string };
}

/**
 * Structure for a recurring event
 */
type StartSpec = { hhmm: string; zone: string };

export type Schedule = {
	guildId: string;
	labels: string[]; // ["A","B","C"]
	blockMs: number; // parse-duration
	start: StartSpec; // { hhmm:"21:00", zone:"Europe/Paris" }
	lenMs: number; // parse-duration
	anchorISO: string; // YYYY-MM-DD (début de journée locale)
	nextBlockIndex: number;
	active: boolean;
	createdBy: string;
	createdAt: number;
};

export type EventRow = {
	scheduleId: string;
	discordEventId?: string;
	label: string;
	start: { iso: string; zone: string };
	lenMs: number;
	status: "created" | "done" | "canceled";
	createdAt: number;
};

export type EventGuildData = {
	schedules: Record<string, Schedule>;
	events: Record<string, EventRow>;
	settings?: { zone?: string; bufferDays?: number; locale?: string; language?: Locale };
	templates: Templates;
};
