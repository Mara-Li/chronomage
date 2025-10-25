import "@/discord_ext";
import * as Djs from "discord.js";
import { WeatherDescribe } from "weather-describe";
import type { EClient } from "@/client";
import { t } from "@/localization";

export const getWeather = {
	data: new Djs.SlashCommandBuilder()
		.setNames("weather.name")
		.setDescriptions("weather.description")
		.setContexts(Djs.InteractionContextType.Guild)
		.addStringOption((opt) =>
			opt.setNames("weather.location").setDescriptions("description.location")
		)
		.addStringOption((opt) =>
			opt.setNames("timezone.name").setDescriptions("timezone.description")
		),
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		const settings = client.settings.get(interaction.guild!.id);
		const location =
			interaction.options.getString(t("weather.location")) ??
			settings?.templates?.weather.location;
		const timezone =
			interaction.options.getString(t("timezone.name")) ?? settings?.settings?.zone;
		const lang =
			settings?.settings?.language ??
			interaction.locale ??
			interaction.guild!.preferredLocale;
		let locale: string = lang as string;
		if (lang === Djs.Locale.EnglishUS || lang === Djs.Locale.EnglishGB) {
			locale = "en";
		}
		const wyd = new WeatherDescribe({
			lang: locale as "fr" | "en",
			timezone,
		});
		const weatherInfo = await wyd.byCity(location);
		if (!weatherInfo) {
			return interaction.reply({
				content: t(lang, "weather.locationNotFound", {
					location,
				}),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}

		return interaction.reply({
			content: weatherInfo.text,
		});
	},
};
