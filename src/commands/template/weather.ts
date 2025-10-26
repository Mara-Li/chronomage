import { isValidCron } from "cron-validator";
import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import { WeatherDescribe } from "weather-describe";
import type { EClient } from "@/client";
import { normalizeLocale } from "@/duration";
import type { EventGuildData, WeatherT } from "@/interface";
import { t } from "@/localization";
import { defaultTemplate, getSettings } from "@/utils";
import { TEMPLATES } from "@/interface/constant";

function display(
	interaction: Djs.ChatInputCommandInteraction,
	settings: EventGuildData,
	ul: TFunction
) {
	if (!interaction.guild) return;
	const weather = settings?.templates?.weather;
	const embed = new Djs.EmbedBuilder()
		.setTitle(ul("weather.display.title"))
		.setColor("Blue")
		.addFields(
			{
				name: ul("weather.display.location"),
				value: weather?.location ?? ul("common.not_set"),
			},
			{
				name: ul("template.compute.name").toTitle(),
				value: `\`${weather?.computeAtStart ? "✅" : "❌"}\``,
			},
			{
				name: ul("common.cron").toTitle(),
				value: `\`${weather?.cron ?? ul("common.not_set")}\``,
			}
		);
	return interaction.reply({ embeds: [embed] });
}

async function set(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	locale: string
) {
	if (!interaction.guild) return;
	const options = interaction.options as Djs.CommandInteractionOptionResolver;
	const location = options.getString(t("weather.location"), true);
	const computeAtStart = options.getBoolean(t("template.compute.name"));
	const cron = options.getString(t("common.cron"));
	const oldSettings = client.settings.get(interaction.guild.id)?.templates?.weather;
	const temp = defaultTemplate();

	const weather: WeatherT = {
		location: location || oldSettings?.location || temp.weather.location,
		computeAtStart:
			computeAtStart || oldSettings?.computeAtStart || temp.weather.computeAtStart,
	};

	if (cron) {
		if (isValidCron(cron)) weather.cron = cron;
		else {
			return interaction.reply({
				content: ul("error.invalid_cron"),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
	}

	//verify if the city exists
	try {
		const wyd = new WeatherDescribe({
			lang: normalizeLocale(locale) as "fr" | "en",
			timezone: client.settings.get(interaction.guild.id)?.settings?.zone,
		});
		const weatherText = await wyd.byCity(location);
		client.settings.set(interaction.guild.id, weather, "templates.weather");
		if (weatherText.current) return interaction.reply(ul("common.success"));
		return interaction.reply({
			content: t("weather.locationNotFound", {
				location,
			}),
			flags: Djs.MessageFlags.Ephemeral,
		});
	} catch (e) {
		console.error(e);
		return interaction.reply({
			content: t("weather.locationNotFound", {
				location,
			}),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
}

export function weather(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	settings: EventGuildData,
	locale: string
) {
	if (!interaction.guild) return;
	const options = interaction.options;
	const location = options.getString(t("weather.location"));
	const computeAtStart = options.getBoolean(t("template.compute.name"));
	const cron = options.getString(t("common.cron"));
	if (!location && computeAtStart == null && !cron)
		return display(interaction, settings, ul);

	return set(client, interaction, ul, locale);
}

export async function processTemplate(
	client: EClient,
	guild: Djs.Guild,
	text: string,
	start = false
): Promise<string> {
	const weatherTemplate = TEMPLATES.weather;
	const weather = client.settings.get(guild.id)?.templates?.weather;
	if (!weather || (weather.computeAtStart && !start)) return text;
	const settings = getSettings(client, guild, Djs.Locale.EnglishUS);
	const lang = settings.settings?.language ?? Djs.Locale.EnglishUS;
	let locale: string = lang as string;
	if (lang === Djs.Locale.EnglishUS || lang === Djs.Locale.EnglishGB) locale = "en";

	const wyd = new WeatherDescribe({
		lang: locale as "fr" | "en",
		timezone: settings.settings?.zone,
	});
	const weatherInfo = await wyd.byCity(weather.location);
	if (text.match(weatherTemplate.emoji)) {
		text = text.replace(weatherTemplate.emoji, weatherInfo ? weatherInfo.emoji : "");
	}
	if (text.match(weatherTemplate.short)) {
		const weatherInfo = await wyd.byCity(weather.location, { short: true });
		text = text.replace(weatherTemplate.short, weatherInfo ? weatherInfo.text : "");
	}
	if (text.match(weatherTemplate.long))
		text = text.replace(weatherTemplate.long, weatherInfo ? weatherInfo.text : "");

	return text;
}
