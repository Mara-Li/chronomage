import * as Djs from "discord.js";
import type { EClient } from "../../client";
import { ln, t } from "../../localization";
import { defaultTemplate } from "../../utils";

function display(client: EClient, interaction: Djs.ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const settings = client.settings.get(interaction.guild.id);
	const ul = ln(settings?.settings?.language ?? interaction.locale);
	const weather = settings?.templates?.weather;
	console.log(weather);
	const embed = new Djs.EmbedBuilder()
		.setTitle(ul("weather.display.title"))
		.setColor("Blue")
		.addFields(
			{
				name: ul("weather.display.location"),
				value: weather?.location ?? ul("common.not_set"),
			},
			{
				name: ul("common.cron"),
				value: `\`${weather?.cron ?? ul("common.not_set")}\``,
			}
		);
	return interaction.reply({ embeds: [embed] });
}

function set(client: EClient, interaction: Djs.ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const options = interaction.options as Djs.CommandInteractionOptionResolver;
	const location = options.getString(t("template.weather.location.name"));
	const temp = defaultTemplate()
	const cron = options.getString(t("common.cron"));
	const settings = client.settings.get(interaction.guild.id);
	if (!settings)
		client.settings.set(interaction.guild.id, {
			templates: temp,
			events: {},
			schedules: {},
			settings: { language: interaction.locale },
		});
	const ul = ln(settings?.settings?.language ?? interaction.locale);

	const weather = {
		location: location ?? temp.weather.location,
		cron: cron ?? temp.weather.cron,
	};
	client.settings.set(interaction.guild.id, weather, "templates.weather");
	return interaction.reply(ul("weather.set.success"));
}

export function weather(client: EClient, interaction: Djs.ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const options = interaction.options;
	const location = options.getString(t("template.weather.location.name"));
	const cron = options.getString(t("common.cron"));
	if (!location && !cron) {
		return display(client, interaction);
	}
	return set(client, interaction);
}
