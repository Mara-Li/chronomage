import type { CronJob } from "cron";
import type { Locale } from "discord.js";

export interface Templates {
	date: {
		format: string;
		cron: string;
		start: string;
		step: number;
		timezone: string;
		currentValue: string;
	};
	count: {
		start: number;
		step: number;
		decimal: number;
		cron: string;
		currentValue: number;
	};
	weather: { location: string };
}

/**
 * Structure for a recurring event
 */
type StartSpec = { hhmm: string; zone: string };

export type Schedule = {
	scheduleId: string; //uuid or another unique id
	labels: string[]; // ["A","B","C"]
	blockMs: number; // parse-duration
	start: StartSpec; // { hhmm:"21:00", zone:"Europe/Paris" }
	lenMs: number; // parse-duration
	anchorISO: string; // YYYY-MM-DD (début de journée locale)
	nextBlockIndex: number;
	active: boolean;
	createdBy: string;
	createdAt: number;
	description?: Record<string, string>; // label -> description
};

export type EventRow = {
	scheduleId: string; // link to Schedule
	discordEventId?: string;
	label: string;
	start: { iso: string; zone: string };
	lenMs: number;
	status: "created" | "done" | "canceled";
	createdAt: number;
};
/*
key = `${scheduleId}:${start.iso}`
 */
export type EventKey = `${string}:${string}`; // scheduleId:startISO

export type EventGuildData = {
	schedules: Record<string, Schedule>; // scheduleId -> Schedule records
	events: Record<EventKey, EventRow>; // scheduleId -> EventRow records
	settings?: { zone?: string; bufferDays?: number; language?: Locale };
	templates: Templates;
};

export const CountJobs = new Map<string, CronJob>();
export const DateJobs = new Map<string, CronJob>();
