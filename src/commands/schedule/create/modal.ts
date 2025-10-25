import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { Schedule } from "@/interface";

export async function buildScheduleModal(
	guild: Djs.Guild,
	userId: string,
	index: number,
	ul: TFunction,
	old?: Schedule

) {
	const oldLabel = old?.labels?.[index - 1] ?? "";
	const oldDescription = old?.description?.[old?.labels?.[index - 1] ?? ""] ?? "";
	const labelEventBuilder: Djs.LabelBuilder = new Djs.LabelBuilder()
		.setLabel(ul("common.label"))
		.setDescription(ul("modals.description"))
		.setTextInputComponent(
			new Djs.TextInputBuilder()
				.setCustomId("label")
				.setStyle(Djs.TextInputStyle.Short)
				.setMaxLength(100)
				.setRequired(true)
				.setValue(oldLabel)
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
				.setValue(oldDescription)
		);

	const imageBuilder: Djs.LabelBuilder = new Djs.LabelBuilder()
		.setLabel(ul("modals.scheduleEvent.image.label"))
		.setDescription(ul("modals.scheduleEvent.image.description"))
		.setFileUploadComponent((input) => input.setCustomId("image").setRequired(false).setMaxValues(1))

	return new Djs.ModalBuilder()
		.setCustomId(`altwiz:${guild.id}:${userId}:${index}`)
		.setTitle(ul("modals.title"))
		.setLabelComponents(labelEventBuilder, descriptionEventBuilder, imageBuilder);
}

export function buttonFollow(guildId: string, userId: string, ul: TFunction) {
	return [
		new Djs.ActionRowBuilder<Djs.ButtonBuilder>().addComponents(
			new Djs.ButtonBuilder()
				.setCustomId(`altwiz-next:${guildId}:${userId}`)
				.setLabel(ul("common.next"))
				.setStyle(Djs.ButtonStyle.Primary)
		),
		new Djs.ActionRowBuilder<Djs.ButtonBuilder>().addComponents(
			new Djs.ButtonBuilder()
				.setCustomId(`altwiz-cancel:${guildId}:${userId}`)
				.setLabel(ul("common.cancel"))
				.setStyle(Djs.ButtonStyle.Danger)
		),
	];
}
