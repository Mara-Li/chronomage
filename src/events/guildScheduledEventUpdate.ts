import * as Djs from "discord.js";
import type { EClient } from "../client";
import { processTemplate } from "../schedule/utils";

export default (client: EClient): void => {
	client.on("guildScheduledEventUpdate", async (oldEvent, newEvent) => {
		console.log(`Guild scheduled event updated: ${newEvent.id}`);
		//compute the templates for the event description
		if (!newEvent.guild) return;
		if (
			(oldEvent?.status === Djs.GuildScheduledEventStatus.Scheduled &&
				newEvent.status === Djs.GuildScheduledEventStatus.Active) ||
			oldEvent?.name !== newEvent.name ||
			oldEvent?.description !== newEvent.description
		) {
			console.log(`New scheduled event started in guild ${newEvent.guild.id}`);
			const settings = client.settings.get(newEvent.guild.id);
			if (!settings?.templates) return;
			let description = newEvent.description || undefined;
			if (description)
				description = await processTemplate(description, client, newEvent.guild, true);
			const name = newEvent.name
				? await processTemplate(newEvent.name, client, newEvent.guild, true)
				: undefined;
			//update the event with the computed description
			await newEvent.edit({
				description,
				name,
			});
		}
	});
};
