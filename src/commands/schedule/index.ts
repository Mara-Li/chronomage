import "@/discord_ext";
import * as Djs from "discord.js";
import type { EClient } from "@/client";
import { handleCancel } from "@/commands/schedule/cancel";
import { handleCreate } from "@/commands/schedule/create";
import { handleEdit } from "@/commands/schedule/edit";
import { handleList } from "@/commands/schedule/list";
import { handlePause } from "@/commands/schedule/pause";
import { t, tFn } from "@/localization";

/**
 * Schedule commands
 * @example /schedule create
 */

export const schedule = {
	data: new Djs.SlashCommandBuilder()
		.setNames("schedule.name")
		.setDescriptions("schedule.description")
		.setContexts(Djs.InteractionContextType.Guild)
		//CREATE SUBCOMMAND
		.addSubcommand((sub) =>
			sub
				.setNames("schedule.create.name")
				.setDescriptions("schedule.create.description")
				.addIntegerOption((o) =>
					o
						.setNames("count.name")
						.setDescriptions("count.description")
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(20)
				)
				.addStringOption((s) =>
					s.setNames("bloc.name").setDescriptions("bloc.description").setRequired(true)
				)
				.addStringOption((o) =>
					o
						.setNames("common.start")
						.setDescriptions("schedule.create.start")
						.setRequired(true)
				)
				.addStringOption((o) =>
					o
						.setNames("common.len")
						.setDescriptions("schedule.create.len.description")
						.setRequired(true)
				)
				.addStringOption((o) =>
					o
						.setNames("location.string.name")
						.setDescriptions("location.string.description")
						.setMaxLength(100)
				)
				.addChannelOption((o) =>
					o
						.setNames("location.vocal.name")
						.setDescriptions("location.vocal.description")
						.addChannelTypes(Djs.ChannelType.GuildVoice, Djs.ChannelType.GuildStageVoice)
				)
				.addStringOption((o) =>
					o.setNames("anchor.name").setDescriptions("anchor.description")
				)
				.addStringOption((o) =>
					o.setNames("timezone.name").setDescriptions("schedule.create.zone.name")
				)
		)
		//LIST SUBCOMMAND
		.addSubcommand((sub) =>
			sub.setNames("schedule.list.name").setDescriptions("schedule.list.description")
		)
		//PAUSE SUBCOMMAND
		.addSubcommand((sub) =>
			sub
				.setNames("schedule.pause.name")
				.setDescriptions("schedule.pause.description")
				.addStringOption((o) =>
					o
						.setNames("common.id")
						.setDescriptions("schedule.pause.id")
						.setAutocomplete(true)
						.setRequired(true)
				)
		)
		//CANCEL SUBCOMMAND
		.addSubcommand((sub) =>
			sub
				.setNames("schedule.cancel.name")
				.setDescriptions("schedule.cancel.description")
				.addStringOption((o) =>
					o
						.setNames("common.id")
						.setDescriptions("schedule.cancel.id")
						.setAutocomplete(true)
						.setRequired(true)
				)
		)
		//EDIT SUBCOMMAND
		.addSubcommandGroup((grp) =>
			grp
				.setNames("schedule.edit.name")
				.setDescriptions("schedule.edit.description")
				//EDIT settings subcommand
				.addSubcommand((sub) =>
					sub
						.setNames("schedule.config.name")
						.setDescriptions("schedule.config.description")
						.addStringOption((o) =>
							o
								.setNames("common.id")
								.setDescriptions("schedule.edit.id")
								.setAutocomplete(true)
								.setRequired(true)
						)
						.addStringOption((opt) =>
							opt
								.setNames("common.len")
								.setDescriptions("schedule.create.len.description")
						)
						.addStringOption((opt) =>
							opt.setNames("common.start").setDescriptions("schedule.create.start")
						)
						.addStringOption((opt) =>
							opt.setNames("timezone.name").setDescriptions("timezone.description")
						)
				)
				//EDIT fields (desc, labels, banners)
				.addSubcommand((sub) =>
					sub
						.setNames("schedule.edit.bloc.name")
						.setDescriptions("schedule.edit.bloc.description")
						.addStringOption((o) =>
							o
								.setNames("common.id")
								.setDescriptions("schedule.edit.id")
								.setAutocomplete(true)
								.setRequired(true)
						)
						.addIntegerOption((o) =>
							o.setNames("bloc.name").setDescriptions("bloc.description").setMinValue(1)
						)
				)
		),
	async autocomplete(interaction: Djs.AutocompleteInteraction, client: EClient) {
		const options = interaction.options as Djs.CommandInteractionOptionResolver;
		const { ul } = tFn(
			interaction.locale,
			interaction.guild!,
			client.settings.get(interaction.guild!.id)!
		);
		const focused = options.getFocused(true);
		const guildData = client.settings.get(interaction.guild!.id);
		if (!guildData) return;
		const choices: { name: string; value: string }[] = [];
		if (focused.name === t("common.id")) {
			for (const [id] of Object.entries(guildData.schedules)) {
				choices.push({ name: id, value: id });
			}
		}
		choices.push({
			name: ul("common.all"),
			value: "all",
		});
		const filtered = choices.filter(
			(choice) =>
				choice.name.subText(focused.value) ||
				choice.value.subText(focused.value.removeAccents())
		);
		await interaction.respond(filtered.slice(0, 25));
	},
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		if (!interaction.guild) return; //tbh impossible bc of setContexts but ts ...
		const subcommand = interaction.options.getSubcommand(true);

		switch (subcommand) {
			case t("schedule.create.name"): {
				return await handleCreate(interaction, client);
			}
			case t("schedule.list.name"): {
				return await handleList(interaction, client);
			}
			case t("schedule.pause.name"): {
				return await handlePause(interaction, client);
			}
			case t("schedule.cancel.name"): {
				return await handleCancel(interaction, client);
			}
			case t("schedule.config.name"): {
				return await handleEdit(interaction, client);
			}
			default: {
				const { ul } = tFn(
					interaction.locale,
					interaction.guild!,
					client.settings.get(interaction.guild!.id)!
				);
				return interaction.reply({
					flags: Djs.MessageFlags.Ephemeral,
					content: ul("error.unknownSubcommand"),
				});
			}
		}
	},
};
