import type * as Djs from "discord.js";
import type { EClient } from "@/client";
import { autoCompleteCommands, commandsList } from "@/commands";
import {
	altScheduleWizard,
	altWizardCancel,
	altWizardNext,
} from "@/commands/schedule/wizard";

export default (client: EClient): void => {
	client.on("interactionCreate", async (interaction: Djs.BaseInteraction) => {
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
		} else if (interaction.isModalSubmit()) {
			const [prefix] = interaction.customId.split(":");
			if (prefix === "altwiz") return altScheduleWizard(interaction, client);
		} else if (interaction.isButton()) {
			const [prefix] = interaction.customId.split(":");
			if (prefix === "altwiz-next") return altWizardNext(interaction, client);
			if (prefix === "altwiz-cancel") return await altWizardCancel(interaction, client);
		} else if (interaction.isAutocomplete()) {
			const autocompleteInteraction = interaction as Djs.AutocompleteInteraction;
			const command = autoCompleteCommands.find(
				(cmd) => cmd.data.name === autocompleteInteraction.commandName
			);
			if (!command) return;
			await command.autocomplete(autocompleteInteraction, client);
		}
	});
};
