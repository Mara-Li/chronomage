import "@/discord_ext";
import dedent from "dedent";
import * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "@/client";
import { startWizardFromSlash } from "@/commands/schedule/wizard";
import { parseDurationLocalized } from "@/duration";
import { t, tFn } from "@/localization";
import { ensureBufferForGuild } from "@/schedule/buffer";
import {
	cancelAll,
	deleteSchedule,
	listSchedules,
	listUpcomingEventsForGuild,
	setScheduleActive,
} from "@/schedule/crud";
import { anchorIsoDate } from "../template/date";

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
							o.setNames("bloc.name").setDescriptions("bloc.description")
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
			case t("schedule.edit.fields.name"): {
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

async function handleCreate(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const { ul, locale } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(interaction.guild!.id)!
	);
	const total = interaction.options.getInteger(t("template.count.name"), true);
	const blocStr = interaction.options.getString(t("schedule.create.bloc.name"), true);
	const startHHMM = interaction.options.getString(t("common.start"), true);
	const lenStr = interaction.options.getString(t("common.len"), true);
	const date = client.settings.get(interaction.guild!.id)?.templates.date;
	const zone =
		interaction.options.getString(t("timezone.name")) || date?.timezone || "UTC";

	// Validate inputs here if necessary, e.g., check date formats, timezones, etc.

	const blocMs = parseDurationLocalized(blocStr, locale);
	const lenMs = parseDurationLocalized(lenStr, locale);
	if (!blocMs || blocMs <= 0) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidBlock", { blocStr }),
		});
	}
	if (!lenMs || lenMs <= 0) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidLength", { lenStr }),
		});
	}
	//validate time with regex HH:MM
	if (!/^\d{2}:\d{2}$/.test(startHHMM)) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidStartTime", { startHHMM }),
		});
	}
	const anchor = anchorIsoDate(interaction, ul, zone, locale, date);
	if (!anchor) return; //anchorIsoDate already replied with error

	const location = interaction.options.getString(t("location.string.name"));
	const vocalChannel = interaction.options.getChannel(t("location.vocal.name")) as
		| Djs.VoiceChannel
		| Djs.StageChannel
		| null;
	let finalLocation = location;
	let locationType: Djs.GuildScheduledEventEntityType | null = null; //
	if (location && vocalChannel) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.locationConflict"),
		});
	}
	if (vocalChannel?.isVoiceBased()) {
		finalLocation = vocalChannel.id;
		//get if the channel is a stage or voice
		if (vocalChannel instanceof Djs.StageChannel) {
			locationType = Djs.GuildScheduledEventEntityType.StageInstance;
		} else locationType = Djs.GuildScheduledEventEntityType.Voice;
	} else if (location) locationType = Djs.GuildScheduledEventEntityType.External;

	if (!locationType) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.noLocation"),
		});
	}

	const modal = await startWizardFromSlash(interaction, client, {
		total,
		blocMs,
		startHHMM,
		lenMs,
		anchorISO: anchor,
		zone,
		location: finalLocation!,
		locationType,
	});
	return await interaction.showModal(modal);
}

async function handleList(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
	const { ul } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(interaction.guild!.id)!
	);
	await interaction.deferReply();
	const schedules = listSchedules(interaction.guild!.id, client);
	const globalSettings = client.settings.get(interaction.guild!.id)?.templates.date;
	if (!schedules.length) {
		return interaction.editReply({
			content: ul("error.noSchedules"),
		});
	}
	const parts: { label: string; lines: string[] }[] = [];
	for (const { id, s } of schedules) {
		const formatDate = DateTime.fromISO(s.anchorISO, { zone: s.start.zone }).toFormat(
			globalSettings?.format ?? "f"
		);
		const part: { label: string; lines: string[] } = { label: "", lines: [] };
		part.label = `**${id}** ${s.active ? "✅" : "❌"}`;
		part.lines.push(
			`__${ul("list.labels")}__\n     - ${s.labels.map((l) => `\`${l}\``).join("\n     - ")}`,
			`__${ul("list.block")}__ \`${(s.blockMs / 3600000).toFixed(1)}h\``,
			`__${ul("list.len")}__ \`${(s.lenMs / 60000).toFixed(0)}min\``,
			`__${ul("list.start")}__ \`${s.start.hhmm} (${s.start.zone})\``,
			`__${ul("list.anchor")}__ ${formatDate}`,
			`__${ul("list.location")}__ ${s.locationType === Djs.GuildScheduledEventEntityType.External ? s.location : `<#${s.location}>`}`,
			`__${ul("list.createdBy")}__ <@${s.createdBy}>`
		);
		if (s.description) {
			const descBits = Object.entries(s.description)
				.map(
					([lbl, txt]) =>
						`\`${lbl}\`: \`${txt.slice(0, 60)}${txt.length > 60 ? "…" : ""}\``
				)
				.join(" | ");
			if (descBits || descBits.length > 0) {
				part.lines.push(`${ul("list.description")} ${descBits}`);
			}
		}
		if (s.banners) {
			const bannerBits = Object.entries(s.banners)
				.map(([lbl, url]) => `[${lbl}](<${url.url}>)`)
				.join(" | ");
			if (bannerBits || bannerBits.length > 0) {
				part.lines.push(`${ul("list.banners")} ${bannerBits}`);
			}
		}
		const upcoming = listUpcomingEventsForGuild(interaction.guildId!, client, 5).map(
			(ev) => {
				const ts = Math.floor(
					DateTime.fromISO(ev.start.iso, { zone: ev.start.zone }).toSeconds()
				);
				return `→ ${ev.label} <t:${ts}:f>`;
			}
		);
		if (upcoming.length) {
			part.lines.push(ul("list.upcomingEvents"));
			for (const u of upcoming) part.lines.push(`  ${u}`);
		}
		parts.push(part);
	}
	const allLines = parts.map((p) => p.lines.join("\n")).join("\n");
	if (allLines.length >= 1090) {
		//send in a message each part
		for (const p of parts) {
			const finalMesssages = `- ${p.label}\n  - ${p.lines.join("\n  - ")}`;
			await interaction.followUp({ content: finalMesssages });
		}
	} else {
		const message = dedent`${parts
			.map((p) => ` - ${p.label}\n   - ${p.lines.join("\n   - ")}`)
			.join("\n\n")}`;
		return interaction.editReply({ content: message });
	}
}

async function handlePause(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const { ul } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(interaction.guild!.id)!
	);
	const scheduleId = interaction.options.getString(t("common.id"), true);
	const ok = setScheduleActive(interaction.guildId!, scheduleId, false, client);
	if (!ok) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidScheduleId", { scheduleId }),
		});
	}
	return interaction.reply(ul("pause.success", { scheduleId }));
}

async function handleCancel(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	await interaction.deferReply();
	const scheduleId = interaction.options.getString(t("common.id"), true);
	const { ul } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(interaction.guild!.id)!
	);
	if (scheduleId === "all") {
		await cancelAll(interaction.guild!, client);
		return interaction.editReply(ul("cancel.allSuccess"));
	}
	const ok = await deleteSchedule(interaction.guild!, scheduleId, client);
	if (!ok) {
		return interaction.editReply({
			content: ul("error.invalidScheduleId", { scheduleId }),
		});
	}
	return interaction.editReply(ul("cancel.success", { scheduleId }));
}

async function handleEdit(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
	// Implementation for edit subcommand goes here
	const guildId = interaction.guildId!;
	const { ul, locale } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(guildId)
	);
	const id = interaction.options.getString("id", true);

	const g = client.settings.get(guildId);
	if (!g?.schedules?.[id]) {
		return interaction.reply({
			content: ul("error.invalidScheduleId", { id }),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
	const s = g.schedules[id];
	const lenStr = interaction.options.getString(t("common.len"));
	const startHHMM = interaction.options.getString(t("common.start"));
	const zone = interaction.options.getString(t("timezone.name"));
	try {
		if (lenStr) s.lenMs = parseDurationLocalized(lenStr, locale);
		if (startHHMM) {
			if (!/^\d{2}:\d{2}$/.test(startHHMM)) new Error("Heure invalide (HH:MM)");
			s.start.hhmm = startHHMM;
		}
		if (zone) s.start.zone = zone;

		// met à jour la date d’ancrage
		s.anchorISO = DateTime.now().setZone(s.start.zone).toISODate()!;
		s.nextBlockIndex = 0;

		g.schedules[id] = s;
		client.settings.set(guildId, g);
		setTimeout(async () => {
			try {
				console.info(`[${guildId}] Boot buffer (post-wizard)...`);
				await ensureBufferForGuild(client, guildId);
			} catch (err) {
				console.error(`[${guildId}] ensureBufferForGuild post-wizard failed:`, err);
				client.settings.delete(guildId, `schedules.${id}`);
				await interaction.followUp({
					content: ul("modals.scheduleEvent.completedError", {
						err: err instanceof Error ? err.message : String(err),
					}),
					flags: Djs.MessageFlags.Ephemeral,
				});
			}
		}, 2000);
		const unchanged = ul("common.noChange");
		return interaction.reply(
			ul("edit.success", {
				id,
				lenStr: lenStr ?? unchanged,
				startHHMM: startHHMM ?? unchanged,
				zone: zone ?? unchanged,
			})
		);
	} catch (err) {
		return interaction.reply({
			content: ul("errors.unknown", {
				err: err instanceof Error ? err.message : String(err),
			}),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
}
