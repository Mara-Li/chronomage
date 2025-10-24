import { isValidCron } from "cron-validator";
import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import type { EClient } from "../../client";
import { setDate } from "../../cron/date";
import { parseDurationLocalized } from "../../duration";
import type { EventGuildData } from "../../interface";
import { t } from "../../localization";
import { defaultTemplate } from "../../utils";

function display(
	interaction: Djs.ChatInputCommandInteraction,
	settings: EventGuildData,
	ul: TFunction
) {
	if (!interaction.guild) return;

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
	const currentValue = date?.currentValue
		? DateTime.fromISO(date?.currentValue, { zone: date?.timezone }).toFormat(
				date?.format ?? "f"
			)
		: (example ?? ul("common.not_set"));
	return interaction.reply({
		embeds: [embed],
		content: ul("template.currentValue", { ex: currentValue }),
	});
}

function convertStep(step: string | null | number, locale: Djs.Locale) {
	if (typeof step === "number") return step;
	if (typeof step === "string") {
		//try to convert to number
		return parseDurationLocalized(step, locale);
	}
	return null;
}

function getOptions(
	interaction: Djs.ChatInputCommandInteraction,
	locale: Djs.Locale,
	setDefault?: boolean
) {
	const defaultDate = setDefault ? defaultTemplate().date : null;

	const options = interaction.options;
	const format = options.getString(t("common.format")) || defaultDate?.format;
	const timezone =
		options.getString(t("template.date.timezone.name")) || defaultDate?.timezone;
	const cron = options.getString(t("common.cron")) || defaultDate?.cron;
	const start = options.getString(t("common.start")) || defaultDate?.start;
	const step =
		convertStep(options.getString(t("common.step")), locale) || defaultDate?.step;
	return { format, timezone, cron, start, step };
}

export function set(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	settings: EventGuildData,
	ul: TFunction
) {
	if (!interaction.guild) return;
	const locale =
		settings?.settings?.language ?? interaction.locale ?? interaction.guildLocale;
	const { format, timezone, cron, start, step } = getOptions(interaction, locale, true);
	if (cron && !isValidCron(cron)) return interaction.reply(ul("error.cron"));

	//convert the duration to number
	const date = {
		format,
		timezone,
		cron,
		start: DateTime.fromFormat(start as string, format as string, {
			zone: timezone as string,
		}).toISO(),
		step,
	};
	client.settings.set(interaction.guild.id, date, "templates.date");
	setDate(interaction.guild, client);
	return interaction.reply(
		ul("date.set.success", {
			ex: DateTime.now()
				.setZone(timezone)
				.toFormat(format as string),
		})
	);
}

export function date(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	settings: EventGuildData
) {
	if (!interaction.guild) return;
	const locale =
		settings?.settings?.language ?? interaction.locale ?? interaction.guildLocale;
	const { format, timezone, cron, start, step } = getOptions(interaction, locale);
	if (!format && !timezone && !cron && !start && step == null)
		return display(interaction, settings, ul);

	return set(client, interaction, settings, ul);
}
