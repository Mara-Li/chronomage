import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "../../client";
import { Wizard, type WizardOptions, wizardKey } from "../../interface";

import { tFn } from "../../localization";

export async function buildScheduleModal(
	guild: Djs.Guild,
	userId: string,
	index: number,
	ul: TFunction
) {
	const labelEventBuilder: Djs.LabelBuilder = new Djs.LabelBuilder()
		.setLabel(ul("common.label"))
		.setDescription(ul("modals.description"))
		.setTextInputComponent(
			new Djs.TextInputBuilder()
				.setCustomId("label")
				.setStyle(Djs.TextInputStyle.Short)
				.setMaxLength(100)
				.setRequired(true)
		);
	const descriptionEventBuilder: Djs.LabelBuilder = new Djs.LabelBuilder()
		.setLabel(ul("common.description"))
		.setDescription(ul("modals.description"))
		.setTextInputComponent(
			new Djs.TextInputBuilder()
				.setCustomId("description")
				.setStyle(Djs.TextInputStyle.Paragraph)
				.setMaxLength(1000)
				.setRequired(false)
		);

	const imageBuilder: Djs.LabelBuilder = new Djs.LabelBuilder()
		.setLabel(ul("modals.scheduleEvent.image.label"))
		.setDescription(ul("modals.scheduleEvent.image.description"))
		.setFileUploadComponent((input) => input.setCustomId("image").setRequired(false));

	return new Djs.ModalBuilder()
		.setCustomId(`altwiz:${guild.id}:${userId}:${index}`)
		.setTitle(ul("modals.scheduleEvent.title"))
		.setLabelComponents(labelEventBuilder, descriptionEventBuilder, imageBuilder);
}

export function buttonFollow(guildId: string, userId: string) {
	return [
		new Djs.ActionRowBuilder<Djs.ButtonBuilder>().addComponents(
			new Djs.ButtonBuilder()
				.setCustomId(`altwiz-next:${guildId}:${userId}`)
				.setLabel("Suivant")
				.setStyle(Djs.ButtonStyle.Primary)
		),
	];
}

export function startWizardFromSlash(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient,
	opts: WizardOptions
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
		labels: [],
		descriptions: {},
		createdBy: userId,
		startedAt: Date.now(),
		location: opts.location,
		locationType: opts.locationType,
		banners: {},
	});

	return buildScheduleModal(interaction.guild!, userId, 1, ul);
}
