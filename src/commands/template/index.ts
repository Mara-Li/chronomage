/** biome-ignore-all lint/style/useNamingConvention: Djs is stupid */
import * as Djs from "discord.js";
import type { EClient } from "@/client";
import { cmdLn, t, tFn } from "@/localization";
import { weather } from "./weather";
import "../../discord_ext.js";
import { getSettings } from "@/utils";
import { LimitedMap } from "../../interfaces/limitedMap";
import { count } from "./count";
import { date } from "./date";
import { pauseTemplateVariable } from "./pause";

export const template = {
	data: new Djs.SlashCommandBuilder()
		.setNames("template.name")
		.setDescriptions("template.description")
		.setContexts(Djs.InteractionContextType.Guild)
		.setIntegrationTypes(Djs.ApplicationIntegrationType.GuildInstall)
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
							opt.setNames("anchor.name").setDescriptions("description.start.date")
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
								.setNames("count.start")
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
						.addChannelOption(
							(opt) =>
								opt
									.setNames("common.channel")
									.setDescriptions("template.channels.channelId")
									.setRequired(true)
							//on autorise tous les channels etc parce que tous les channels ont des noms
						)
						.addStringOption(
							(opt) =>
								opt
									.setNames("common.message")
									.setDescriptions("template.channels.text.description")
									.setRequired(false) //si non fourni, on supprime le template
						)
				)
				.addSubcommand((sub) =>
					sub
						.setNames("template.channels.send.name")
						.setDescriptions("template.channels.send.description")
						.addChannelOption(
							(opt) =>
								opt
									.setNames("common.channel")
									.setDescriptions("template.channels.channelId")
									.setRequired(true)
									.addChannelTypes(Djs.ChannelType.GuildText) //seulement les channels textuels peuvent recevoir des messages
						)
						.addStringOption(
							(opt) =>
								opt
									.setNames("common.message")
									.setDescriptions("template.channels.text.description")
									.setRequired(false) //si non fourni, on supprime le template
						)
				)
				.addSubcommand((sub) =>
					sub
						.setNames("template.channels.display.name")
						.setDescriptions("template.channels.display.description")
						.addStringOption((opt) =>
							opt
								.setNames("common.type")
								.setDescriptions("template.channels.display.type")
								.setRequired(false)
								.addChoices(
									{
										name: t("template.channels.rename.name").toTitle(),
										value: "rename",
										name_localizations: cmdLn("template.channels.rename.name", true),
									},
									{
										name: t("template.channels.send.name").toTitle(),
										value: "send",
										name_localizations: cmdLn("template.channels.send.name", true),
									}
								)
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
			case t("template.channels.rename.name"):
				return await setRenameChannel(interaction, client);
			case t("template.channels.display.name"):
				return await displayTemplateChannels(client, interaction);
			case t("template.channels.send.name"):
				return await setSendChannel(interaction, client);
			default:
				return;
		}
	},
};

async function setRenameChannel(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const channel = interaction.options.getChannel(t("common.channel"), true);
	const message = interaction.options.getString(t("common.message"));
	if (!interaction.guild) return;
	const settings = getSettings(client, interaction.guild, interaction.locale);
	if (!settings.renameChannels) settings.renameChannels = new LimitedMap(5);
	const { ul } = tFn(interaction.locale, interaction.guild, settings);
	try {
		if (message) {
			settings.renameChannels.set(channel.id, message);
			client.settings.set(interaction.guild.id, settings);
			interaction.reply({
				content: ul("template.channels.rename.success", {
					channel: channel.id,
					template: message,
				}),
				flags: Djs.MessageFlags.Ephemeral,
			});
		} else {
			settings.renameChannels.delete(channel.id);
			client.settings.set(interaction.guild.id, settings);
			interaction.reply({
				content: ul("template.channels.rename.deleteSuccess", {
					channel: channel.id,
				}),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
	} catch (e) {
		if (e instanceof Error && e.name === "ErrorLimitReached") {
			await interaction.reply({
				content: ul("error.limitReached"),
				flags: Djs.MessageFlags.Ephemeral,
			});
			return;
		}
		console.error(e);
		await interaction.reply({
			content: ul("error.unknown", { error: e instanceof Error ? e.message : String(e) }),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
}

async function setSendChannel(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const channel = interaction.options.getChannel(t("common.channel"), true);
	const message = interaction.options.getString(t("common.message"));
	if (!interaction.guild) return;
	const settings = getSettings(client, interaction.guild, interaction.locale);
	if (!settings.textChannels) settings.textChannels = new LimitedMap(5);
	const { ul } = tFn(interaction.locale, interaction.guild, settings);
	try {
		if (message) {
			settings.textChannels.set(channel.id, message);
			client.settings.set(interaction.guild.id, settings);
			interaction.reply({
				content: ul("template.channels.send.success", {
					channel: channel.id,
					template: message,
				}),
				flags: Djs.MessageFlags.Ephemeral,
			});
		} else {
			settings.textChannels.delete(channel.id);
			client.settings.set(interaction.guild.id, settings);
			interaction.reply({
				content: ul("template.channels.send.deleteSuccess", {
					channel: channel.id,
				}),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
	} catch (e) {
		if (e instanceof Error && e.name === "ErrorLimitReached") {
			await interaction.reply({
				content: ul("error.limitReached"),
				flags: Djs.MessageFlags.Ephemeral,
			});
			return;
		}
		console.error(e);
		await interaction.reply({
			content: ul("error.unknown", { error: e instanceof Error ? e.message : String(e) }),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
}

async function displayTemplateChannels(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction
) {
	if (!interaction.guild) return;
	const settings = getSettings(client, interaction.guild, interaction.locale);
	const { ul } = tFn(interaction.locale, interaction.guild, settings);

	const type = interaction.options.getString(t("common.type"));
	const finalMessage: string[] = [];
	if (!type) {
		//on affiche tout
		if (settings.renameChannels && settings.renameChannels.size > 0) {
			finalMessage.push(ul("template.channels.display.rename"));
			for (const [channelId, template] of settings.renameChannels) {
				finalMessage.push(`- <#${channelId}> : \`${template}\``);
			}
		}
		if (settings.textChannels && settings.textChannels.size > 0) {
			finalMessage.push(ul("template.channels.display.send"));
			for (const [channelId, template] of settings.textChannels) {
				finalMessage.push(`- <#${channelId}> : \`${template}\``);
			}
		}
		await interaction.reply({
			content:
				finalMessage.length > 0
					? finalMessage.join("\n")
					: ul("template.channels.display.noTemplates"),
			flags: Djs.MessageFlags.Ephemeral,
		});
	} else if (type === "rename") {
		//on affiche les rename
		if (settings.renameChannels && settings.renameChannels.size > 0) {
			finalMessage.push(ul("template.channels.display.rename"));
			for (const [channelId, template] of settings.renameChannels) {
				finalMessage.push(`- <#${channelId}> : \`${template}\``);
			}
			await interaction.reply({
				content: finalMessage.join("\n"),
				flags: Djs.MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: ul("template.channels.display.noTemplates"),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
	} else if (type === "send") {
		//on affiche les send
		if (settings.textChannels && settings.textChannels.size > 0) {
			finalMessage.push(ul("template.channels.display.send"));
			for (const [channelId, template] of settings.textChannels) {
				finalMessage.push(`- <#${channelId}> : \`${template}\``);
			}
			await interaction.reply({
				content: finalMessage.join("\n"),
				flags: Djs.MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: ul("template.channels.display.noTemplates"),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
	}
}
