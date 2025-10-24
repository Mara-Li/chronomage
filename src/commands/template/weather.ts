import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "../../client";
import { TEMPLATES, type EventGuildData } from "../../interface";
import { t } from "../../localization";
import { defaultTemplate, getSettings } from "../../utils";
import { WeatherDescribe } from "weather-describe";

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
		.addFields({
			name: ul("weather.display.location"),
			value: weather?.location ?? ul("common.not_set"),
		});
	return interaction.reply({ embeds: [embed] });
}

function set(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	if (!interaction.guild) return;
	const options = interaction.options as Djs.CommandInteractionOptionResolver;
	const location = options.getString(t("weather.location"));
	const temp = defaultTemplate();

	const weather = {
		location: location ?? temp.weather.location,
	};

	client.settings.set(interaction.guild.id, weather, "templates.weather");
	return interaction.reply(ul("common.success"));
}

export function weather(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	settings: EventGuildData
) {
	if (!interaction.guild) return;
	const options = interaction.options;
	const location = options.getString(t("weather.location"));
	if (!location) return display(interaction, settings, ul);

	return set(client, interaction, ul);
}

export async function processTemplate(client: EClient, guild: Djs.Guild, text: string) {
	const weatherTemplate = TEMPLATES.weather;
	const weather = client.settings.get(guild.id)?.templates?.weather;
	if (!weather) return text;
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
	if (text.match(weatherTemplate.long)) {
		text = text.replace(weatherTemplate.long, weatherInfo ? weatherInfo.text : "");
	}
	return text;
}
