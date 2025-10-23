import * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "../../client";
import {ln, t} from "../../localization";
import { defaultTemplate } from "../../utils";

function display(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
	if (!interaction.guild) return;
	const settings = client.settings.get(interaction.guild!.id);
	if (!settings) {
		client.settings.set(interaction.guild.id, {
			templates: defaultTemplate(),
			events: {},
			schedules: {},
			settings: { language: interaction.locale },
		});
	}
	const ul = ln(settings?.settings?.language ?? interaction.locale);
	const date = settings?.templates.date;

	const formatDateStart = (dateStr?: string, format = "f") => {
		if (!dateStr) return null;
		return DateTime.fromISO(dateStr).toFormat(format);
	};

	const embed = new Djs.EmbedBuilder()
		.setTitle(ul("date.display.title"))
		.setColor("Blue")
		.addFields(
			{
				name: ul("common.format").toTitle(),
				value: `\`${date?.format ?? ul("common.not_set")}\``,
			},
			{
				name: ul("common.cron"),
				value: `\`${date?.cron ?? ul("common.not_set")}\``,
			},
			{
				name: ul("common.start").toTitle(),
				value: formatDateStart(date?.start, date?.format) ?? ul("common.not_set"),
			},
			{
				name: ul("template.date.timezone.name").toTitle(),
				value: date?.timezone ?? ul("common.not_set"),
			},
			{
				name: ul("common.step").toTitle(),
				value: date ? `\`${date.step}\`` : ul("common.not_set"),
			}
		);
	const example = formatDateStart(date?.start ?? DateTime.now().toISO(), date?.format);
	const currentValue = date?.currentValue ? DateTime.fromISO(date?.currentValue, { zone: date?.timezone }).toFormat(date?.format ?? "f") : example ?? ul("common.not_set");
	return interaction.reply({
		embeds: [embed],
		content: ul("template.currentValue", { ex: currentValue }),
	});
}

function getOptions(interaction: Djs.ChatInputCommandInteraction, setDefault?: boolean) {
	const defaultDate = setDefault ? defaultTemplate().date : null;
	const options = interaction.options;
		const format = options.getString(t("common.format")) || defaultDate?.format ;
	const timezone = options.getString(t("template.date.timezone.name")) || defaultDate?.timezone ;
	const cron = options.getString(t("common.cron")) || defaultDate?.cron ;
	const start = options.getString(t("common.start")) || defaultDate?.start ;
	const step = options.getInteger(t("common.step")) || defaultDate?.step ;
	return { format, timezone, cron, start, step };
}

export function set(client: EClient, interaction: Djs.ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const options = interaction.options;
	const temp = defaultTemplate();
	const defaultDate = temp.date;
	const { format, timezone, cron, start, step } = getOptions(interaction, true);

	const settings = client.settings.get(interaction.guild.id);
	if (!settings)
		client.settings.set(interaction.guild.id, {
			templates: temp,
			events: {},
			schedules: {},
			settings: { language: interaction.locale },
		});
	const date = {
		format,
		timezone,
		cron,
		start: DateTime.fromFormat(start as string, format as string, { zone: timezone as string }).toISO(),
		step,
	}
	client.settings.set(interaction.guild.id, date, "templates.date");
	const ul = ln(settings?.settings?.language ?? interaction.locale);
	return interaction.reply(ul("date.set.success", {
		ex: DateTime.now().setZone(timezone).toFormat(format as string)
	}));
}

export function date(client: EClient, interaction: Djs.ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const { format, timezone, cron, start, step } = getOptions(interaction);
	if (!format && !timezone && !cron && !start && !step) {
		return display(interaction, client);
	}
	return set(client, interaction);
}
