import * as Djs from "discord.js";
import type { EClient } from "../client";
import { autoCompleteCommands, commandsList } from "../commands";
import { buildScheduleModal, buttonFollow } from "../commands/schedule/modal";
import { Wizard, wizardKey } from "../interface";
import { tFn } from "../localization";
import { ensureBufferForGuild } from "../schedule/buffer";
import { createSchedule } from "../schedule/crud";
import { getSettings } from "../utils";

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

async function altScheduleWizard(
	interaction: Djs.ModalSubmitInteraction,
	client: EClient
) {
	const [, guildId, userId, _index] = interaction.customId.split(":");
	if (interaction.guildId !== guildId || interaction.user.id !== userId) {
		await interaction.reply({
			content: "This modal is not for you.",
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}
	const state = Wizard.get(wizardKey(guildId, userId));
	if (!state) {
		await interaction.reply({
			content: "Wizard state not found or has expired.",
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}
	const label = interaction.fields.getTextInputValue("label").trim();
	const description = interaction.fields.getTextInputValue("description").trim();
	state.labels.push(label);
	if (description.length) state.descriptions[label] = description;
	state.current += 1;
	Wizard.set(wizardKey(guildId, userId), state);

	//continue to the next modal
	if (state.current <= state.total) {
		await interaction.reply({
			content: `Event ${state.current - 1} saved as "${label}". Preparing next event...`,
			flags: Djs.MessageFlags.Ephemeral,
			components: buttonFollow(guildId, userId),
		});
	}
	const { blocStr, startHHMM, lenStr, anchorISO, zone } = state.base;
	const labels = state.labels;
	const g = client.settings.get(guildId)!;

	const { scheduleId } = createSchedule(g, client, {
		guildId: state.guildId,
		labels,
		blocStr,
		startHHMM,
		lenStr,
		anchorISO,
		createdBy: state.userId,
		zone,
	});

	g.schedules[scheduleId] = {
		...g.schedules[scheduleId],
		description: state.descriptions,
	};
	client.settings.set(guildId, g);

	Wizard.delete(wizardKey(guildId, userId));
	await ensureBufferForGuild(client, guildId);

	await interaction.reply({
		content: "Events created successfully!",
		flags: Djs.MessageFlags.Ephemeral,
	});
}

async function altWizardNext(interaction: Djs.ButtonInteraction, client: EClient) {
	const [, guildId, userId] = interaction.customId.split(":");
	const state = Wizard.get(wizardKey(guildId, userId));
	if (!state || interaction.user.id !== userId || interaction.guildId !== guildId) {
		await interaction.reply({
			content: "Wizard state not found or has expired.",
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}
	const guild = interaction.guild;
	const { ul } = tFn(
		interaction.locale,
		guild!,
		getSettings(client, guild!, interaction.locale)
	);
	await interaction.showModal(
		await buildScheduleModal(interaction.guild!, userId, state.current, ul)
	);
}
