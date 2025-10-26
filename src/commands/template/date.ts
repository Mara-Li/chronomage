import { isValidCron } from "cron-validator";
import * as Djs from "discord.js";
import humanizeDuration from "humanize-duration";
import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import type { EClient } from "@/client";
import { setDate } from "@/cron";
import { parseDurationLocalized } from "@/duration";
import type { DateT, EventGuildData } from "@/interface";
import { TEMPLATES } from "@/interface/constant";
import { t } from "@/localization";
import { defaultTemplate } from "@/utils";

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

	const humanizeStep = (step: number | null | undefined) => {
		if (step == null) return ul("common.not_set");
		return humanizeDuration(step, { language: interaction.locale });
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
				name: ul("timezone.name").toTitle(),
				value: date?.timezone ?? ul("common.not_set"),
			},
			{
				name: ul("common.step").toTitle(),
				value: date ? `\`${humanizeStep(date.step)}\`` : ul("common.not_set"),
			},
			{
				name: ul("template.compute.name").toTitle(),
				value: `\`${date?.computeAtStart ? "✅" : "❌"}\``,
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
	setDefault?: boolean,
	oldData?: DateT
) {
	const defaultDate = setDefault ? defaultTemplate().date : null;
	const fallBack = oldData || defaultDate;

	const options = interaction.options;
	const format = options.getString(t("common.format")) || fallBack?.format;
	const timezone = options.getString(t("timezone.name")) || fallBack?.timezone;
	const cron = options.getString(t("common.cron")) || fallBack?.cron;
	const start = options.getString(t("common.start")) || fallBack?.start;
	const step = convertStep(options.getString(t("common.step")), locale) || fallBack?.step;
	const compute =
		interaction.options.getBoolean(t("template.compute.name")) ||
		fallBack?.computeAtStart;
	return { format, timezone, cron, start, step, compute };
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
	const { format, timezone, cron, start, step, compute } = getOptions(
		interaction,
		locale,
		true,
		settings.templates.date
	);
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
		computeAtStart: compute,
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
	const { format, timezone, cron, start, step, compute } = getOptions(
		interaction,
		locale,
		false
	);
	if (!format && !timezone && !cron && !start && step == null && compute == null)
		return display(interaction, settings, ul);

	return set(client, interaction, settings, ul);
}

export function processTemplate(
	client: EClient,
	guild: Djs.Guild,
	text: string,
	start = false
) {
	const settings = client.settings.get(guild.id);
	const dateTemplate = settings?.templates.date;
	if (!dateTemplate || (dateTemplate.computeAtStart && !start)) return text;
	const template = TEMPLATES.date;
	if (text.match(template)) {
		const dt = DateTime.fromISO(dateTemplate.currentValue, {
			zone: dateTemplate.timezone,
		}).toFormat(dateTemplate.format);
		return text.replace(template, dt);
	}
	return text;
}

export function anchorIsoDate(
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	zone: string,
	locale: string,
	date?: DateT
) {
	const rawAnchor =
		interaction.options.getString(t("anchor.name")) ??
		DateTime.now().setZone(zone).plus({ minutes: 30 }).toISO();

	// 2. on essaie deux parse possibles : format custom et ISO
	const parsedFromFormat =
		date && rawAnchor
			? DateTime.fromFormat(rawAnchor, date.format, { zone, locale })
			: null;

	const parsedFromISO = rawAnchor ? DateTime.fromISO(rawAnchor, { zone }) : null;

	// 3. choisir la première date valide
	const parsed = parsedFromFormat?.isValid
		? parsedFromFormat
		: parsedFromISO?.isValid
			? parsedFromISO
			: null;

	if (!parsed) {
		interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidAnchorDate", {
				anchorISO: rawAnchor,
				format: date?.format,
			}),
		});
		return;
	}

	// 4. normaliser en YYYY-MM-DD (=> ton "anchor" final)
	const anchor = parsed.toISODate()!;

	// 5. vérifier que c'est pas dans le passé dans ce fuseau
	const nowInZone = DateTime.now().setZone(zone);
	if (parsed < nowInZone) {
		interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.pastAnchorDate", {
				anchor: parsed.toLocaleString(DateTime.DATETIME_FULL),
			}),
		});
		return;
	}
	return anchor;
}
