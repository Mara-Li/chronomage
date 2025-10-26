import "@/discord_ext";
import * as Djs from "discord.js";
import type { EClient } from "@/client";
import { ln, t, tFn } from "@/localization";

export const globalSettings = {
	data: new Djs.SlashCommandBuilder()
		.setNames("globalSettings.settings")
		.setDescriptions("globalSettings.description")
		.setContexts(Djs.InteractionContextType.Guild)
		.addSubcommand((sub) =>
			sub
				.setNames("timezone.name")
				.setDescriptions("timezone.description")
				.addStringOption((opt) =>
					opt
						.setNames("timezone.name")
						.setDescriptions("timezone.description")
						.setRequired(true)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setNames("globalSettings.language.name")
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
		)
		.addSubcommand((sub) =>
			sub
				.setNames("globalSettings.minFuturBlock.name")
				.setDescriptions("globalSettings.minFuturBlock.description")
				.addIntegerOption((opt) =>
					opt
						.setNames("globalSettings.minFuturBlock.name")
						.setDescriptions("globalSettings.minFuturBlock.description")
						.setRequired(true)
						.setMinValue(1)
				)
		)
		.addSubcommand((sub) =>
			sub
				.setNames("globalSettings.autorename.name")
				.setDescriptions("globalSettings.autorename.description")
				.addBooleanOption((opt) =>
					opt
						.setNames("template.pause.name")
						.setDescriptions("globalSettings.autorename.switch")
						.setRequired(true)
				)
		),
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		const subcommand = interaction.options.getSubcommand();

		if (!interaction.guild) return;
		const { ul } = tFn(
			interaction.locale,
			interaction.guild,
			client.settings.get(interaction.guild.id)!
		);
		if (subcommand === t("timezone.name")) {
			const timezone = interaction.options.getString(t("timezone.name"), true);
			client.settings.set(interaction.guild.id, timezone, "settings.zone");
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
		if (subcommand === t("globalSettings.minFuturBlock.name")) {
			const minFuturBlock = interaction.options.getInteger(
				t("globalSettings.minFuturBlock.name"),
				true
			);
			client.settings.set(interaction.guild.id, minFuturBlock, "settings.futurMinBlock");

			return interaction.reply(
				ul("globalSettings.minFuturBlock.set", { futurMinBlock: minFuturBlock })
			);
		}
		if (subcommand === t("globalSettings.autorename.name")) {
			const autoRenameChannel = interaction.options.getBoolean(
				t("template.pause.name"),
				true
			);
			client.settings.set(
				interaction.guild.id,
				autoRenameChannel,
				"settings.autoRenameChannel"
			);
			return interaction.reply(
				ul("globalSettings.autorename.set", {
					status: autoRenameChannel ? ul("common.enabled") : ul("common.disabled"),
				})
			);
		}
	},
};
