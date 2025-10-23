import type { DateTime, Duration } from "luxon";

export interface Templates {
	date: { format: string; cron: string; start: DateTime; step: number };
	count: { start: number; step: number; minDigits: number; cron: string };
	weather: { location: string; cron: string };
}

/**
 * Structure for a recurring event
 * @example {
 *   name: "City - Market (Day), City - Market (Night)",
 *   id: "city-market-day",
 *   bloc: Duration.fromObject({ days: 1 }),
 *   start: "2024-01-01T08:00:00Z",
 *   len: Duration.fromObject({ hours: 10 })
 * }
 */
export interface RecurringEvent {
	name: string;
	description?: string;
	id: string; //* Unique identifier for the event */
	bloc: Duration;
	start: string;
	len: Duration;
	count?: number;
}
