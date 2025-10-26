import type * as Djs from "discord.js";
import type { EClient } from "@/client";
import { setWeather } from "@/cron/weather";
import { setCount } from "./count";
import { setDate } from "./date";

export function initAll(guild: Djs.Guild, client: EClient): void {
	// Initialize all cron CountJobs here
	setCount(guild, client);
	setDate(guild, client);
	setWeather(guild, client);
}
