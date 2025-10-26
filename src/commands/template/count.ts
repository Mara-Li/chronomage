import { isValidCron } from "cron-validator";
import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "@/client";
import { setCount } from "@/cron";
import type { CountT, EventGuildData } from "@/interface";
import { TEMPLATES } from "@/interface/constant";
import { t } from "@/localization";
import { defaultTemplate, getSettings } from "@/utils";

function display(
	interaction: Djs.ChatInputCommandInteraction,
	settings: EventGuildData,
	ul: TFunction
) {
	if (!interaction.guild) return;
	const temp = defaultTemplate();

	const template = settings?.templates ?? temp;

	const count = template.count;
	const embed = new Djs.EmbedBuilder()
		.setTitle(ul("count.display.title"))
		.setColor("Blue")
		.addFields(
			{
				name: ul("common.start").toTitle(),
				value: `\`${count?.start ?? ul("common.not_set")}\``,
			},
			{
				name: ul("common.step").toTitle(),
				value: `\`${count?.step ?? ul("common.not_set")}\``,
			},
			{
				name: ul("common.cron").toTitle(),
				value: `\`${count?.cron ?? ul("common.not_set")}\``,
			},
			{
				name: ul("template.decimal.name").toTitle(),
				value: `\`${count?.decimal ?? ul("common.not_set")}\``,
			},
			{
				name: ul("template.compute.name").toTitle(),
				value: `\`${count?.computeAtStart ? "✅" : "❌"}\``,
			}
		);

	const currentValue = count?.currentValue ?? count?.start ?? 0;
	const decimalPlaces = count?.decimal ?? 0;
	const factor = 10 ** decimalPlaces;
	const formattedValue = (Math.round(currentValue * factor) / factor).toFixed(
		decimalPlaces
	);

	return interaction.reply({
		embeds: [embed],
		content: ul("common.example", { ex: formattedValue }),
	});
}

function getOptions(
	interaction: Djs.ChatInputCommandInteraction,
	setDefault?: boolean,
	oldData?: CountT
) {
	const defaultTemplateData = setDefault ? defaultTemplate().count : null;
	const start =
		interaction.options.getNumber(t("common.start")) ||
		oldData?.start ||
		defaultTemplateData?.start;
	const step =
		interaction.options.getNumber(t("common.step")) ||
		oldData?.step ||
		defaultTemplateData?.step;
	const cron =
		interaction.options.getString(t("common.cron")) ||
		oldData?.cron ||
		defaultTemplateData?.cron;
	const decimal =
		interaction.options.getInteger(t("template.decimal.name")) ||
		oldData?.decimal ||
		defaultTemplateData?.decimal;
	const compute =
		interaction.options.getBoolean(t("template.compute.name")) ||
		oldData?.computeAtStart ||
		defaultTemplateData?.computeAtStart;
	return { start, step, cron, decimal, compute };
}

function set(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	settings: EventGuildData,
	ul: TFunction
) {
	if (!interaction.guild) return;
	const temp = defaultTemplate();

	const template = settings?.templates ?? temp;

	const { start, step, cron, decimal, compute } = getOptions(
		interaction,
		true,
		template.count
	);
	template.count.start = start ?? template.count.start;
	template.count.step = step ?? template.count.step;
	template.count.cron = cron ?? template.count.cron;
	template.count.computeAtStart = compute ?? template.count.computeAtStart;
	template.count.decimal = decimal ?? template.count.decimal;

	if (!isValidCron(template.count.cron)) return interaction.reply(ul("error.cron"));

	client.settings.set(interaction.guild.id, settings!);
	setCount(interaction.guild, client);
	return interaction.reply(ul("common.success"));
}

export function count(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	settings: EventGuildData
) {
	if (!interaction.guild) return;
	const { start, step, cron, decimal, compute } = getOptions(interaction);
	if (!cron && start == null && step == null && decimal == null && compute == null)
		return display(interaction, settings, ul);

	return set(client, interaction, settings, ul);
}

export function processTemplate(
	client: EClient,
	guild: Djs.Guild,
	text: string,
	start = false,
	templatesRegex = TEMPLATES
) {
	const settings = getSettings(client, guild, Djs.Locale.EnglishUS);
	const template = templatesRegex.date;
	const count = settings.templates.count;
	if (!count || (count.computeAtStart && !start)) return text;
	if (text.match(template)) {
		const currentValue = count?.currentValue ?? count?.start ?? 0;
		const decimalPlaces = count?.decimal ?? 0;
		const factor = 10 ** decimalPlaces;
		const formattedValue = (Math.round(currentValue * factor) / factor).toFixed(
			decimalPlaces
		);
		return text.replaceAll(template, formattedValue);
	}
	return text;
}
