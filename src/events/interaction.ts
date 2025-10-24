import * as Djs from "discord.js";
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
	await interaction.deferReply({ flags: Djs.MessageFlags.Ephemeral });
	try {
		const ul = tFn(
			interaction.locale,
			interaction.guild!,
			getSettings(client, interaction.guild!, interaction.locale)
		).ul;

		const [, guildId, userId, _index] = interaction.customId.split(":");

		if (interaction.guildId !== guildId || interaction.user.id !== userId) {
			await interaction.editReply({
				content: ul("errors.unauthorized"),
			});
			return;
		}

		const state = Wizard.get(wizardKey(guildId, userId));
		if (!state) {
			await interaction.editReply({
				content: ul("errors.wizardNotFound"),
			});
			return;
		}

		// 1. récupérer ce que l'utilisateur vient d'envoyer dans ce modal
		const label = interaction.fields.getTextInputValue("label").trim();
		const description = interaction.fields.fields.get("description")
			? interaction.fields.getTextInputValue("description").trim()
			: "";
		const att = getBannerHash(interaction); // si t'as une bannière

		// 2. maj du wizard state
		state.labels.push(label);
		if (description.length) state.descriptions[label] = description;
		if (att) state.banners[label] = att;
		state.current += 1;
		Wizard.set(wizardKey(guildId, userId), state);

		// 3. S'il reste des étapes => on s'arrête là, on renvoie le bouton "Suivant"
		if (state.current <= state.total) {
			return await interaction.editReply({
				content: ul("modals.scheduleEvent.nextPrompt", {
					current: state.current - 1,
					total: state.total,
					label,
				}),
				components: buttonFollow(guildId, userId),
			});
		}

		// 4. Sinon on est à la dernière étape : on enregistre le schedule en base
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

		// on ajoute descriptions et bannières par label
		g.schedules[scheduleId] = {
			...g.schedules[scheduleId],
			description: state.descriptions,
			banners: state.banners,
			// active reste true
		};
		client.settings.set(guildId, g);

		// 5. on clôture le wizard ici
		Wizard.delete(wizardKey(guildId, userId));

		// 6. on répond direct à l'utilisateur, sans lancer ensureBufferForGuild maintenant
		await interaction.editReply({
			content: ul("modals.scheduleEvent.completedQuick", {
				scheduleId,
			}),
		});

		// fin. pas d'appel lourd ici.
		setTimeout(async () => {
			try {
				console.info(`[${guildId}] Boot buffer (post-wizard)...`);
				await ensureBufferForGuild(client, guildId);
			} catch (err) {
				console.error(`[${guildId}] ensureBufferForGuild post-wizard failed:`, err);
			}
		}, 2000);
	} catch (err) {
		console.error("[altScheduleWizard] error at final step:", err);

		if (!interaction.replied && !interaction.deferred) {
			try {
				await interaction.reply({
					content: "Une erreur est survenue, l'événement n'a pas été planifié.",
					flags: Djs.MessageFlags.Ephemeral,
				});
			} catch {
				// ignore
			}
		}
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
