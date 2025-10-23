import * as Djs from "discord.js";
import type { EClient } from "../../client";
import { t } from "../../localization";
import { weather } from "./weather";
import "../../discord_ext";
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
				.addNumberOption((opt) =>
					opt.setNames("common.step").setDescriptions("description.step")
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
				)
				.addNumberOption((opt) =>
					opt
						.setNames("common.step")
						.setDescriptions("description.step")
						.setRequired(false)
				)
				.addNumberOption((opt) =>
					opt
						.setNames("template.decimal.name")
						.setDescriptions("template.decimal.description")
						.setRequired(false)
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
						.setNames("template.weather.location.name")
						.setDescriptions("template.weather.description")
						.setRequired(false)
				)
				.addStringOption((opt) =>
					opt
						.setNames("common.cron")
						.setDescriptions("description.cron")
						.setRequired(false)
				);
		}),
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case t("template.weather.name"):
				return weather(client, interaction);
			case t("common.date"):
				return date(client, interaction);
			default:
				return interaction.reply(t("common.not_implemented"));
		}
	},
};
