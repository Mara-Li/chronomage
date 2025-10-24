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
	location?: string;
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

export const DEFAULT_ZONE = "Europe/Paris";
export const DEFAULT_BUFFER_DAYS = 14;
export const eventKey = (scheduleId: string, startIso: string): EventKey =>
	`${scheduleId}:${startIso}`;

export const TEMPLATES = {
	date: /\{{2}date\}{2}/gi,
	count: /\{{2}count\}{2}/gi,
	weather: {
		short: /\{{2}weather:(short)\}{2}/gi,
		emoji: /\{{2}weather:(emoji)\}{2}/gi,
		long: /\{{2}weather:(long)\}{2}/gi,
	},
};

export type WizardState = {
	guildId: string;
	userId: string;
	total: number;
	current: number; // index en cours (1-based)
	base: {
		blocStr: string;
		startHHMM: string;
		lenStr: string;
		anchorISO?: string;
		zone?: string;
	};
	labels: string[];
	descriptions: Record<string, string>;
	createdBy: string;
	startedAt: number;
};

/**
 * key = `${guildId}:${userId}`
 */
export type WizardKey = `${string}:${string}`;

export const wizardKey = (guildId: string, userId: string): WizardKey =>
	`${guildId}:${userId}`;

export const Wizard = new Map<WizardKey, WizardState>();
