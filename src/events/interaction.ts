import type { BaseInteraction } from "discord.js";
import type { EClient } from "../client";
import { commandsList } from "../commands";

export default (client: EClient): void => {
	client.on("interactionCreate", async (interaction: BaseInteraction) => {
		if (interaction.isChatInputCommand()) {
			const command = commandsList.find(
				(cmd) => cmd.data.name === interaction.commandName
			);
			if (!command) return;
			try {
				await command.execute(interaction, client);
			} catch (error) {
				console.log(error);
			}
		}
	});
};
