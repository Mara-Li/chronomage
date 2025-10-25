import "../../discord_ext";
import dedent from "dedent";
import * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "../../client";
import { parseDurationLocalized } from "../../duration";
import { t, tFn } from "../../localization";
import {
	cancelAll,
	deleteSchedule,
	listSchedules,
	listUpcomingEventsForGuild,
	setScheduleActive,
} from "../../schedule/crud";
import { anchorIsoDate } from "../template/date";
import { startWizardFromSlash } from "./modal";

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
						.setNames("template.count.name")
						.setDescriptions("schedule.create.count.description")
						.setRequired(true)
						.setMinValue(1)
						.setMaxValue(20)
				)
				.addStringOption((s) =>
					s
						.setNames("schedule.create.bloc.name")
						.setDescriptions("schedule.create.bloc.description")
						.setRequired(true)
				)
				.addStringOption((o) =>
					o
						.setNames("common.start")
						.setDescriptions("schedule.create.start")
						.setRequired(true)
				)
				.addStringOption((o) =>
					o
						.setNames("schedule.len.name")
						.setDescriptions("schedule.create.len.description")
						.setRequired(true)
				)
				.addStringOption((o) =>
					o
						.setNames("schedule.location.string.name")
						.setDescriptions("schedule.location.string.description")
						.setMaxLength(100)
				)
				.addChannelOption((o) =>
					o
						.setNames("schedule.location.vocal.name")
						.setDescriptions("schedule.location.vocal.description")
						.addChannelTypes(Djs.ChannelType.GuildVoice, Djs.ChannelType.GuildStageVoice)
				)
				.addStringOption((o) =>
					o
						.setNames("schedule.create.anchor.name")
						.setDescriptions("schedule.create.anchor.description")
				)
				.addStringOption((o) =>
					o
						.setNames("template.date.timezone.name")
						.setDescriptions("schedule.create.zone.name")
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
	const lenStr = interaction.options.getString(t("schedule.len.name"), true);
	const date = client.settings.get(interaction.guild!.id)?.templates.date;
	const zone =
		interaction.options.getString(t("template.date.timezone.name")) ||
		date?.timezone ||
		"UTC";

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

	const location = interaction.options.getString(t("schedule.location.string.name"));
	const vocalChannel = interaction.options.getChannel(
		t("schedule.location.vocal.name")
	) as Djs.VoiceChannel | Djs.StageChannel | null;
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
