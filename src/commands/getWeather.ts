import "@/discord_ext";
import * as Djs from "discord.js";
import { WeatherDescribe } from "weather-describe";
import type { EClient } from "@/client";
import { normalizeLocale } from "@/duration";
import { t, tFn } from "@/localization";
import { getSettings } from "@/utils";

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
		const { ul, locale } = tFn(
			interaction.locale,
			interaction.guild!,
			getSettings(client, interaction.guild!, interaction.locale)
		);
		let localeSettings = normalizeLocale(locale);
		if (localeSettings !== "en" && localeSettings !== "fr") {
			localeSettings = "en";
		}
		const wyd = new WeatherDescribe({
			lang: localeSettings as "fr" | "en",
			timezone,
		});
		try {
			const weatherInfo = await wyd.byCity(location);
			if (!weatherInfo) {
				return interaction.reply({
					content: ul("weather.locationNotFound", {
						location: location?.toTitle(),
					}),
					flags: Djs.MessageFlags.Ephemeral,
				});
			}

			return interaction.reply({
				content: weatherInfo.text.long,
			});
		} catch (e) {
			return interaction.reply({
				content: ul("weather.locationNotFound", {
					location: location?.toTitle(),
				}),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
	},
};
