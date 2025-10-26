import type * as Djs from "discord.js";
import { processTemplate } from "@/buffer/utils";
import type { EClient } from "@/client";
import { setWeather } from "@/cron/weather";
import type { ChannelTextT, RenameChannel } from "@/interface";
import type { LimitedMap } from "../interfaces/limitedMap";
import { setCount } from "./count";
import { setDate } from "./date";

export function initAll(guild: Djs.Guild, client: EClient): void {
	// Initialize all cron CountJobs here
	setCount(guild, client);
	setDate(guild, client);
	setWeather(guild, client);
}

export async function processTemplateChannels(
	guild: Djs.Guild,
	client: EClient,
	channelData?: RenameChannel,
	channelText?: ChannelTextT
) {
	if (!channelData && !channelText) return;
	const entriesOrEmpty = <T>(m?: LimitedMap<string, T>) =>
		m ? Array.from(m.entries()) : ([] as [string, T][]);

	const renameTasks = entriesOrEmpty(channelData).map(async ([channelId, template]) => {
		try {
			const text = await processTemplate(template, client, guild, true);
			if (!text) return { channelId, ok: false, reason: "no-text" };

			const channel = guild.channels.cache.get(channelId);
			if (!channel) return { channelId, ok: false, reason: "missing-channel" };
			await channel.setName(text);
			return { channelId, ok: true };
		} catch (err) {
			console.error(`Error renaming channel ${channelId}:`, err);
			return {
				channelId,
				ok: false,
				reason: err instanceof Error ? err.message : String(err),
			};
		}
	});

	// Build tasks for sending messages
	const messageTasks = entriesOrEmpty(channelText).map(async ([channelId, template]) => {
		try {
			const text = await processTemplate(template, client, guild, true);
			if (!text) return { channelId, ok: false, reason: "no-text" };

			const channel = guild.channels.cache.get(channelId);
			if (!channel || !channel.isTextBased())
				return { channelId, ok: false, reason: "missing-or-not-text" };

			await channel.send({ content: text });
			return { channelId, ok: true };
		} catch (err) {
			console.error(`Error sending message to channel ${channelId}:`, err);
			return {
				channelId,
				ok: false,
				reason: err instanceof Error ? err.message : String(err),
			};
		}
	});

	// Run all tasks concurrently and inspect results; don't fail-fast.
	const settled = await Promise.allSettled([...renameTasks, ...messageTasks]);

	for (const r of settled) {
		if (r.status === "rejected") {
			console.error("processTemplateChannels task rejected:", r.reason);
		} else if (r.value && r.value.ok === false) {
			console.debug?.(
				`processTemplateChannels: ${r.value.channelId} skipped: ${r.value.reason}`
			);
		}
	}
}

export { setCount } from "./count";
export { setDate } from "./date";
export { setWeather } from "./weather";
