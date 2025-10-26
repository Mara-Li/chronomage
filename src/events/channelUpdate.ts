import { processTemplate } from "@/buffer/utils";
import type { EClient } from "@/client";
import { CHANNEL_TEMPLATES } from "@/interface/constant";

export const onChannelUpdate = (client: EClient): void => {
	client.on("channelUpdate", async (oldChannel, newChannel) => {
		if (oldChannel.isDMBased() || newChannel.isDMBased()) return;
		if (oldChannel.name !== newChannel.name) {
			const guild = newChannel.guild;
			const settings = client.settings.get(guild.id);
			if (!settings?.templates || !settings.settings?.autoRenameChannel) return;

			const newName = await processTemplate(
				newChannel.name,
				client,
				guild,
				true,
				CHANNEL_TEMPLATES
			);
			if (newName && newName !== newChannel.name) {
				try {
					await newChannel.setName(newName);
				} catch (error) {
					console.error(`Failed to rename channel ${newChannel.id}:`, error);
				}
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
		const newName = await processTemplate(
			channel.name,
			client,
			guild,
			true,
			CHANNEL_TEMPLATES
		);
		if (newName && newName !== channel.name) {
			try {
				await channel.setName(newName);
			} catch (error) {
				console.error(`Failed to rename channel ${channel.id}:`, error);
			}
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
