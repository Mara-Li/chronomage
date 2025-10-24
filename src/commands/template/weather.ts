import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "../../client";
import type { EventGuildData } from "../../interface";
import { t } from "../../localization";
import { defaultTemplate } from "../../utils";

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
