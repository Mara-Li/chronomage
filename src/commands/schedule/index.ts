import "../discord_ext";
import dedent from "dedent";
import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import type { EClient } from "../../client";
import { parseDurationLocalized } from "../../duration";
import { t, tFn } from "../../localization";
import {
	deleteSchedule,
	listSchedules,
	listUpcomingEventsForGuild,
	setScheduleActive,
} from "../../schedule/crud";
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
				)
		),
	async autocomplete(interaction: Djs.AutocompleteInteraction, client: EClient) {
		const options = interaction.options as Djs.CommandInteractionOptionResolver;
		const focused = options.getFocused(true);
		const guildData = client.settings.get(interaction.guild!.id);
		if (!guildData) return;
		const choices: { name: string; value: string }[] = [];
		if (focused.name === t("common.id")) {
			for (const [id, s] of Object.entries(guildData.schedules)) {
				choices.push({ name: s.labels.join(", "), value: id });
			}
		}
		const filtered = choices.filter(
			(choice) =>
				choice.name.subText(focused.value) ||
				choice.value.subText(focused.value.removeAccents())
		);
		await interaction.respond(filtered.slice(0, 25));
	},
	async execute(interaction: Djs.ChatInputCommandInteraction, client: EClient) {
		if (!interaction.guild) return; //tbh impossible bc of setContexts but ts ...
		const guild = interaction.guild.id;
		const subcommand = interaction.options.getSubcommand(true);
		const ul = tFn(interaction.locale, interaction.guild, client.settings.get(guild)!).ul;
		switch (subcommand) {
			case t("schedule.create.name"): {
				return await handleCreate(interaction, client);
			}
			case t("schedule.list.name"): {
				return await handleList(interaction, client, ul);
			}
			case t("schedule.pause.name"): {
				return await handlePause(interaction, client, ul);
			}
			case t("schedule.cancel.name"): {
				return await handleCancel(interaction, client, ul);
			}
			default:
				return interaction.reply({
					flags: Djs.MessageFlags.Ephemeral,
					content: ul("error.unknownSubcommand"),
				});
		}
	},
};

async function handleCreate(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const total = interaction.options.getInteger(t("template.count.name"), true);
	const blocStr = interaction.options.getString(t("schedule.create.bloc.name"), true);
	const startHHMM = interaction.options.getString(t("common.start"), true);
	const lenStr = interaction.options.getString(t("schedule.len.name"), true);
	const anchorISO =
		interaction.options.getString(t("schedule.create.anchor.name")) ?? undefined;
	const zone =
		interaction.options.getString(t("template.date.timezone.name")) ?? undefined;
	const { ul, locale } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(interaction.guild!.id)!
	);

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

	const date = client.settings.get(interaction.guild!.id)?.templates.date;
	const globalSettings = client.settings.get(interaction.guild!.id)?.settings;
	const zoneToUse = zone || globalSettings?.zone || date?.timezone;
	const fromFormat =
		date && anchorISO
			? DateTime.fromFormat(date.format, anchorISO, { zone: zoneToUse, locale })
			: null;
	const fromIso = anchorISO ? DateTime.fromISO(anchorISO, { zone: zoneToUse }) : null;
	if (!fromIso?.isValid && !fromFormat?.isValid) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidAnchorDate", { anchorISO, format: date }),
		});
	}

	let anchor = anchorISO;
	if (fromFormat?.isValid) {
		anchor = fromFormat.toISODate()!;
	} else if (fromIso?.isValid) {
		anchor = fromIso.toISODate()!;
	}

	const modal = await startWizardFromSlash(interaction, client, {
		total,
		blocMs,
		startHHMM,
		lenMs,
		anchorISO: anchor,
		zone,
	});
	return await interaction.showModal(modal);
}

async function handleList(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient,
	ul: TFunction
) {
	const schedules = listSchedules(interaction.guild!.id, client);
	const globalSettings = client.settings.get(interaction.guild!.id)?.templates.date;
	if (!schedules.length) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.noSchedules"),
		});
	}
	const parts: { label: string; lines: string[] }[] = [];
	for (const { id, s } of schedules) {
		const formatDate = DateTime.fromISO(s.anchorISO, { zone: s.start.zone }).toFormat(
			globalSettings?.format ?? "f"
		);
		const part: { label: string; lines: string[] } = { label: "", lines: [] };
		part.label = `- **${id}** ${s.active ? "✅" : "❌"} - ${s.labels.join(", ")}`;
		part.lines.push(
			`Label(s): ${s.labels.join(", ")}`,
			`${ul("list.block")} ${(s.blockMs / 3600000).toFixed(1)}h`,
			`${ul("list.len")} ${(s.lenMs / 60000).toFixed(0)}min`,
			`${ul("list.start")}: ${s.start.hhmm} (${s.start.zone})`,
			`${ul("list.anchor")}: ${formatDate}`
		);
		if (s.description) {
			const descBits = Object.entries(s.description)
				.map(([lbl, txt]) => `${lbl}: ${txt.slice(0, 60)}${txt.length > 60 ? "…" : ""}`)
				.join(" | ");
			if (descBits || descBits.length > 0) {
				part.lines.push(`Description(s): ${descBits}`);
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
	const allLines = parts.map((p) => p.lines.join("\n  - "));
	if (allLines.length >= 2000) {
		//send in a message each part
		for (const p of parts) {
			const finalMesssages = `- ${p.label}\n  - ${p.lines.join("\n  - ")}`;
			await interaction.followUp({ content: finalMesssages });
		}
	} else {
		const message = dedent`${parts
			.map((p) => `- ${p.label}\n  - ${p.lines.join("\n  - ")}`)
			.join("\n\n")}`;
		return interaction.reply({ content: message });
	}
}

async function handlePause(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient,
	ul: TFunction
) {
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
	client: EClient,
	ul: TFunction
) {
	const scheduleId = interaction.options.getString(t("common.id"), true);
	const ok = deleteSchedule(interaction.guild!, scheduleId, client);
	if (!ok) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidScheduleId", { scheduleId }),
		});
	}
	return interaction.reply(ul("cancel.success", { scheduleId }));
}
