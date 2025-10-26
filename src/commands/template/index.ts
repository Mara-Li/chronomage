/** biome-ignore-all lint/style/useNamingConvention: Djs is stupid */
import * as Djs from "discord.js";
import type { EClient } from "@/client";
import { cmdLn, t, tFn } from "@/localization";
import { weather } from "./weather";
import "@/discord_ext";
import { getSettings } from "@/utils";
import { count } from "./count";
import { date } from "./date";
import { pauseTemplateVariable } from "./pause";

export const template = {
	data: new Djs.SlashCommandBuilder()
		.setNames("template.name")
		.setDescriptions("template.description")
		.setContexts(Djs.InteractionContextType.Guild)
		.setDefaultMemberPermissions(Djs.PermissionsBitField.Flags.ManageEvents)
		.addSubcommandGroup((group) =>
			group
				.setNames("template.manage.name")
				.setDescriptions("template.manage.description")
				/**
				 * Date subcommand
				 */
				.addSubcommand((sub) =>
					sub
						.setNames("common.date")
						.setDescriptions("template.date.description")
						.addStringOption((opt) =>
							opt
								.setNames("common.format")
								.setDescriptions("template.date.format")
								.setRequired(false)
						)
						.addStringOption((opt) =>
							opt
								.setNames("timezone.name")
								.setDescriptions("timezone.description")
								.setRequired(false)
						)
						.addStringOption((opt) =>
							opt
								.setNames("common.cron")
								.setDescriptions("description.cron")
								.setRequired(false)
						)
						.addStringOption((opt) =>
							opt.setNames("common.start").setDescriptions("description.start.date")
						)
						.addStringOption((opt) =>
							opt.setNames("common.step").setDescriptions("template.date.step")
						)
						.addBooleanOption((opt) =>
							opt
								.setNames("template.compute.name")
								.setDescriptions("template.compute.description")
								.setRequired(false)
						)
				)
				/**
				 * Count subcommand
				 */
				.addSubcommand((sub) =>
					sub
						.setNames("count.name")
						.setDescriptions("template.count.description")
						.addNumberOption((opt) =>
							opt
								.setNames("common.start")
								.setDescriptions("description.start.number")
								.setRequired(false)
								.setMinValue(0)
						)
						.addNumberOption((opt) =>
							opt
								.setNames("common.step")
								.setDescriptions("description.step")
								.setRequired(false)
								.setMinValue(1)
						)
						.addIntegerOption((opt) =>
							opt
								.setNames("template.decimal.name")
								.setDescriptions("template.decimal.description")
								.setRequired(false)
								.setMinValue(0)
						)
						.addStringOption((opt) =>
							opt
								.setNames("common.cron")
								.setDescriptions("description.cron")
								.setRequired(false)
						)
						.addBooleanOption((opt) =>
							opt
								.setNames("template.compute.name")
								.setDescriptions("template.compute.description")
								.setRequired(false)
						)
				)
				/**
				 * Weather subcommand
				 */
				.addSubcommand((sub) => {
					return sub
						.setNames("weather.name")
						.setDescriptions("template.weather.description")
						.addStringOption((opt) =>
							opt
								.setNames("weather.location")
								.setDescriptions("description.location")
								.setRequired(false)
						)
						.addBooleanOption((opt) =>
							opt
								.setNames("template.compute.name")
								.setDescriptions("template.compute.description")
								.setRequired(false)
						)
						.addStringOption((opt) =>
							opt
								.setNames("common.cron")
								.setDescriptions("template.weather.cron")
								.setRequired(false)
						);
				})
		)
		/**
		 * Set on pause
		 */
		.addSubcommand((sub) =>
			sub
				.setNames("template.pause.name")
				.setDescriptions("template.pause.description")
				.addStringOption((opt) =>
					opt
						.setNames("template.name")
						.setDescriptions("template.pause.variable")
						.setRequired(false)
						.addChoices(
							{
								name: t("common.date").toTitle(),
								value: "date",
								name_localizations: cmdLn("common.date", true),
							},
							{
								name: t("count.name").toTitle(),
								value: "count",
								name_localizations: cmdLn("count.name", true),
							},
							{
								name: t("weather.name").toTitle(),
								value: "weather",
								name_localizations: cmdLn("weather.name", true),
							},
							{
								name: t("common.all"),
								value: "all",
								name_localizations: cmdLn("common.all", true),
							}
						)
				)
		)
		.addSubcommandGroup((grp) =>
			grp
				.setNames("common.channel")
				.setDescriptions("template.channels.description")
				.addSubcommand((sub) =>
					sub
						.setNames("template.channels.rename.name")
						.setDescriptions("template.channels.rename.description")
						.addChannelOption((opt) =>
							opt
								.setNames("common.channel")
								.setDescriptions("template.channels.channelId")
								.setRequired(true)
								.addChannelTypes(Djs.ChannelType.GuildText, Djs.ChannelType.GuildCategory)
						)
						.addStringOption((opt) =>
							opt
								.setNames("common.message")
								.setDescriptions("template.channels.text.description")
								.setRequired(true)
						)
				)
				.addSubcommand((sub) =>
					sub
						.setNames("template.channels.send.name")
						.setDescriptions("template.channels.send.description")
						.addChannelOption((opt) =>
							opt
								.setNames("common.channel")
								.setDescriptions("template.channels.channelId")
								.setRequired(true)
								.addChannelTypes(Djs.ChannelType.GuildText)
						)
						.addStringOption((opt) =>
							opt
								.setNames("common.message")
								.setDescriptions("template.channels.text.description")
								.setRequired(true)
						)
				)
		),
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		const subcommand = interaction.options.getSubcommand();
		if (!interaction.guild) return;
		const settings = getSettings(client, interaction.guild, interaction.locale);
		const { ul, locale } = tFn(interaction.locale, interaction.guild, settings);

		switch (subcommand) {
			case t("weather.name"):
				return weather(client, interaction, ul, settings, locale);
			case t("common.date"):
				return date(client, interaction, ul, settings);
			case t("count.name"):
				return count(client, interaction, ul, settings);
			case t("template.pause.name"):
				return await pauseTemplateVariable(client, interaction);
			default:
				return;
		}
	},
};
