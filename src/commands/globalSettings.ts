import "../discord_ext";
import * as Djs from "discord.js";
import type { EClient } from "../client";
import { ln, t } from "../localization";

export const globalSettings = {
	data: new Djs.SlashCommandBuilder()
		.setNames("globalsettings.name")
		.setDescriptions("globalsettings.description")
		.setContexts(Djs.InteractionContextType.Guild)
		.addSubcommand((sub) =>
			sub
				.setNames("template.date.timezone.name")
				.setDescriptions("template.date.timezone.description")
				.addStringOption((opt) =>
					opt
						.setNames("template.date.timezone.name")
						.setDescriptions("template.date.timezone.description")
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setNames("globalSettings.language")
				.setDescriptions("globalSettings.language.description")
				.addStringOption((opt) =>
					opt
						.setNames("globalSettings.language.name")
						.setDescriptions("globalSettings.language.description")
						.setRequired(true)
						.addChoices(
							{ name: "English", value: Djs.Locale.EnglishUS },
							{ name: "Français", value: Djs.Locale.French }
						)
				)
		),
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		const subcommand = interaction.options.getSubcommand();
		if (!interaction.guild) return;
		if (subcommand === t("template.date.timezone.name")) {
			const timezone = interaction.options.getString(
				t("template.date.timezone.name"),
				true
			);
			client.settings.set(interaction.guild.id, timezone, "settings.zone");
			const lang =
				client.settings.get(interaction.guild.id)?.settings?.language ??
				interaction.locale;
			const ul = ln(lang);
			return interaction.reply(ul("globalSettings.timezone.set", { tz: timezone }));
		}
		if (subcommand === t("globalSettings.language.name")) {
			const language = interaction.options.getString(
				t("globalSettings.language.name"),
				true
			) as Djs.Locale;
			client.settings.set(interaction.guild.id, { language }, "settings");
			const ul = ln(language);
			return interaction.reply(ul("globalSettings.language.set", { lang: language }));
		}
	},
};
