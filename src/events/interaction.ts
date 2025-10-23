import type { BaseInteraction, Client } from "discord.js";

import { commandsList } from "../commands";

export default (client: Client): void => {
	client.on("interactionCreate", async (interaction: BaseInteraction) => {
		if (interaction.isChatInputCommand()) {
			const command = commandsList.find(
				(cmd) => cmd.data.name === interaction.commandName
			);
			if (!command) return;
			try {
				await command.execute(interaction);
			} catch (error) {
				console.log(error);
			}
		}
	});
};
