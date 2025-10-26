import { processTemplate } from "@/buffer/utils";
import type { EClient } from "@/client";

export const onChannelUpdate = (client: EClient): void => {
	client.on("channelUpdate", async (oldChannel, newChannel) => {
		if (oldChannel.isDMBased() || newChannel.isDMBased()) return;
		if (oldChannel.name !== newChannel.name) {
			const guild = newChannel.guild;
			const settings = client.settings.get(guild.id);
			if (!settings?.templates || !settings.settings?.autoRenameChannel) return;
			const newName = await processTemplate(newChannel.name, client, guild, true);
			if (newName && newName !== newChannel.name) {
				await newChannel.setName(newName);
			}
		}
	});
};

export const onChannelCreate = (client: EClient): void => {
	client.on("channelCreate", async (channel) => {
		if (channel.isDMBased()) return;
		const guild = channel.guild;
		const settings = client.settings.get(guild.id);
		if (!settings?.templates || !settings.settings?.autoRenameChannel) return;
		const newName = await processTemplate(channel.name, client, guild, true);
		if (newName && newName !== channel.name) {
			await channel.setName(newName);
		}
	});
};

export const onChannelDelete = (client: EClient): void => {
	client.on("channelDelete", async (channel) => {
		//clean the data in settings.renameChannels and settings.textChannels
		if (channel.isDMBased()) return;
		const guild = channel.guild;
		const settings = client.settings.get(guild.id);
		if (!settings) return;
		if (settings.renameChannels?.has(channel.id)) {
			settings.renameChannels.delete(channel.id);
			client.settings.set(guild.id, settings);
		}
		if (settings.textChannels?.has(channel.id)) {
			settings.textChannels.delete(channel.id);
			client.settings.set(guild.id, settings);
		}
	});
};
