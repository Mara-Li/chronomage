import type { CronJob } from "cron";
import type { EventKey, WizardKey, WizardState } from "./index";

export const CountJobs = new Map<string, CronJob>();
export const DateJobs = new Map<string, CronJob>();
export const WeatherJobs = new Map<string, CronJob>();
export const DEFAULT_ZONE = "Europe/Paris";
export const TEMPLATES = {
	date: /\{{2}date\}{2}/gi,
	count: /\{{2}count\}{2}/gi,
	weather: {
		short: /\{{2}weather:(short)\}{2}/gi,
		emoji: /\{{2}weather:(emoji)\}{2}/gi,
		long: /\{{2}weather:(long)\}{2}/gi,
	},
};
export const Wizard = new Map<WizardKey, WizardState>();
export const eventKey = (scheduleId: string, startIso: string): EventKey =>
	`${scheduleId}:${startIso}`;
export const wizardKey = (guildId: string, userId: string): WizardKey =>
	`${guildId}:${userId}`;
