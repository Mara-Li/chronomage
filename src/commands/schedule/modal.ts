import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "../../client";
import { Wizard, wizardKey } from "../../interface";

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

	return new Djs.ModalBuilder()
		.setCustomId(`altwiz:${guild.id}:${userId}:${index}`)
		.setTitle(ul("modals.scheduleEvent.title"))
		.setLabelComponents(labelEventBuilder, descriptionEventBuilder);
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
	opts: {
		total: number;
		blocMs: number;
		startHHMM: string;
		lenMs: number;
		anchorISO?: string;
		zone?: string;
	}
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
			blocStr: opts.blocMs.toString(),
			startHHMM: opts.startHHMM,
			lenStr: opts.lenMs.toString(),
			anchorISO: opts.anchorISO,
			zone: opts.zone,
		},
		labels: [],
		descriptions: {},
		createdBy: userId,
		startedAt: Date.now(),
	});

	return buildScheduleModal(interaction.guild!, userId, 1, ul);
}
