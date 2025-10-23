import type * as Djs from "discord.js";
import type { EClient } from "../client";
import { setCount } from "./count";
import { setDate } from "./date";

export function initAll(guild: Djs.Guild, client: EClient): void {
	// Initialize all cron CountJobs here
	setCount(guild, client);
	setDate(guild, client);
}
