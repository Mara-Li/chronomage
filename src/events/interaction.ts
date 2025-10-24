import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "../client";
import { autoCompleteCommands, commandsList } from "../commands";
import { buildScheduleModal, buttonFollow } from "../commands/schedule/modal";
import { type BannerSpec, Wizard, wizardKey } from "../interface";
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
	const ul = tFn(
		interaction.locale,
		interaction.guild!,
		getSettings(client, interaction.guild!, interaction.locale)
	).ul;
	const [, guildId, userId, _index] = interaction.customId.split(":");
	if (interaction.guildId !== guildId || interaction.user.id !== userId) {
		await interaction.reply({
			content: ul("errors.unauthorized"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}
	const state = Wizard.get(wizardKey(guildId, userId));
	if (!state) {
		await interaction.reply({
			content: ul("errors.wizardNotFound"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}
	const label = interaction.fields.getTextInputValue("label").trim();
	const description = interaction.fields.getTextInputValue("description").trim();
	const att = getBannerHash(interaction);

	state.labels.push(label);
	if (description.length) state.descriptions[label] = description;
	if (att) state.banners[label] = att;
	state.current += 1;
	Wizard.set(wizardKey(guildId, userId), state);

	//continue to the next modal
	if (state.current <= state.total) {
		return await interaction.reply({
			content: ul("modals.scheduleEvent.nextPrompt", {
				current: state.current - 1,
				total: state.total,
				label,
			}),
			flags: Djs.MessageFlags.Ephemeral,
			components: buttonFollow(guildId, userId),
		});
	}
	const { blocMs, startHHMM, lenMs, anchorISO, zone } = state.base;
	const labels = state.labels;
	const g = client.settings.get(guildId)!;

	const { scheduleId } = createSchedule(g, {
		guildId,
		labels,
		blocMs,
		startHHMM,
		lenMs,
		anchorISO,
		createdBy: state.userId,
		zone,
		location: state.location,
		locationType: state.locationType,
	});

	g.schedules[scheduleId] = {
		...g.schedules[scheduleId],
		description: state.descriptions,
		banners: state.banners,
	};
	client.settings.set(guildId, g);
	try {
		await ensureBufferForGuild(client, guildId);
		await interaction.reply({
			content: ul("modals.scheduleEvent.completed"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		Wizard.delete(wizardKey(guildId, userId));
	} catch (error) {
		await interaction.reply({
			content: ul("errors.unknown", { error: String(error) }),
			flags: Djs.MessageFlags.Ephemeral,
		});
		//delete the schedule on error
		client.settings.delete(guildId, `schedules.${scheduleId}`);
		Wizard.delete(wizardKey(guildId, userId));
		console.error(error);
	}
}

async function altWizardNext(interaction: Djs.ButtonInteraction, client: EClient) {
	const [, guildId, userId] = interaction.customId.split(":");
	const guild = interaction.guild;

	const { ul } = tFn(
		interaction.locale,
		guild!,
		getSettings(client, guild!, interaction.locale)
	);
	const state = Wizard.get(wizardKey(guildId, userId));
	if (!state || interaction.user.id !== userId || interaction.guildId !== guildId) {
		await interaction.reply({
			content: ul("errors.wizardNotFound"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}

	await interaction.showModal(
		await buildScheduleModal(interaction.guild!, userId, state.current, ul)
	);
}

function getBannerHash(interaction: Djs.ModalSubmitInteraction): BannerSpec | undefined {
	const banner = interaction.fields.getUploadedFiles("image", false);
	if (!banner) return;
	const file = banner.first();
	if (!file) return;
	return {
		url: file.url,
		contentType: file.contentType,
	};
}
