import * as Djs from "discord.js";
import { createEvent, ensureBufferForGuild } from "@/buffer";
import type { EClient } from "@/client";
import { createSchedule } from "@/commands/schedule/create";
import { buildScheduleModal, buttonFollow } from "@/commands/schedule/create/modal";
import { type Schedule, Wizard, type WizardOptions, type WizardState, wizardKey } from "@/interface";
import { tFn } from "@/localization";
import { getBannerHash, getSettings } from "@/utils";

export function startWizardFromSlash(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient,
	opts: WizardOptions,
	old?: Schedule
) {
	const guildId = interaction.guildId!;
	const userId = interaction.user.id;

	const { ul } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(guildId)
	);

	Wizard.set(wizardKey(guildId, userId), {
		guildId,
		userId,
		total: opts.total,
		current: 1,
		base: {
			blocMs: opts.blocMs,
			startHHMM: opts.startHHMM,
			lenMs: opts.lenMs,
			anchorISO: opts.anchorISO,
			zone: opts.zone,
		},
		labels: old?.labels ? old.labels : [],
		descriptions: old?.description ? old.description : {},
		createdBy: userId,
		startedAt: Date.now(),
		location: opts.location,
		locationType: opts.locationType,
		banners: {},
	});

	return buildScheduleModal(interaction.guild!, userId, 1, ul);
}

export async function altWizardCancel(
	interaction: Djs.ButtonInteraction,
	client: EClient
) {
	const [, guildId, userId] = interaction.customId.split(":");

	const { ul } = tFn(
		interaction.locale,
		interaction.guild!,
		getSettings(client, interaction.guild!, interaction.locale)
	);
	const state = Wizard.get(wizardKey(guildId, userId));
	if (!state || interaction.user.id !== userId || interaction.guildId !== guildId) {
		await interaction.reply({
			content: ul("errors.wizardNotFound"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}

	Wizard.delete(wizardKey(guildId, userId));
	await interaction.reply({
		content: ul("modals.canceled"),
		flags: Djs.MessageFlags.Ephemeral,
	});
}

export async function altScheduleWizard(
	interaction: Djs.ModalSubmitInteraction,
	client: EClient
) {
	await interaction.deferReply();
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
				components: buttonFollow(guildId, userId, ul),
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
		await createEvent(guildId, scheduleId, client, interaction, ul);
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

export async function altWizardNext(interaction: Djs.ButtonInteraction, client: EClient) {
	const [, guildId, userId] = interaction.customId.split(":");
	const guild = interaction.guild;
	//delete interaction.message;
	await interaction.message.delete();

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
