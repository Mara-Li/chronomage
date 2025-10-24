import * as Djs from "discord.js";
import type { EClient } from "../../client";
import { t, tFn } from "../../localization";
import { weather } from "./weather";
import "../../discord_ext";
import { getSettings } from "../../utils";
import { count } from "./count";
import { date } from "./date";

export const template = {
	data: new Djs.SlashCommandBuilder()
		.setNames("template.name")
		.setDescriptions("template.description")
		.setContexts(Djs.InteractionContextType.Guild)
		.setDefaultMemberPermissions(Djs.PermissionsBitField.Flags.ManageEvents)
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
						.setNames("template.date.timezone.name")
						.setDescriptions("template.date.timezone.description")
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
		)
		/**
		 * Count subcommand
		 */
		.addSubcommand((sub) =>
			sub
				.setNames("template.count.name")
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
		)
		/**
		 * Weather subcommand
		 */
		.addSubcommand((sub) => {
			return sub
				.setNames("template.weather.name")
				.setDescriptions("template.weather.description")
				.addStringOption((opt) =>
					opt
						.setNames("weather.location")
						.setDescriptions("description.location")
						.setRequired(false)
				);
		}),
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		const subcommand = interaction.options.getSubcommand();
		if (!interaction.guild) return;
		const settings = getSettings(client, interaction.guild, interaction.locale);
		const { ul } = tFn(interaction.locale, interaction.guild, settings);

		switch (subcommand) {
			case t("template.weather.name"):
				return weather(client, interaction, ul, settings);
			case t("common.date"):
				return date(client, interaction, ul, settings);
			case t("template.count.name"):
				return count(client, interaction, ul, settings);
			default:
				return;
		}
	},
};
