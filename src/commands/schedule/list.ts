import dedent from "dedent";
import * as Djs from "discord.js";
import humanizeDuration from "humanize-duration";
import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import type { EClient } from "@/client";
import type { DateT, EventGuildData, Schedule } from "@/interface";
import { tFn } from "@/localization";

function listUpcomingEventsForSchedule(
	guildId: string,
	scheduleId: string,
	client: EClient,
	limit = 5
) {
	return listAllUpcomingForSchedule(guildId, scheduleId, client).slice(0, limit);
}

type Part = { label: string; lines: string[]; upcoming: string[] };

export function listAllUpcomingForSchedule(
	guildId: string,
	scheduleId: string,
	client: EClient
) {
	const g = client.settings.get(guildId);
	if (!g) return [];
	const now = DateTime.now();
	return Object.values(g.events)
		.filter((e) => {
			if (e.status !== "created" || e.scheduleId !== scheduleId) return false;
			const eventStart = DateTime.fromISO(e.start.iso, { zone: e.start.zone });
			return eventStart > now; // Only future events
		})
		.sort((a, b) => a.start.iso.localeCompare(b.start.iso));
}

function listSchedules(guildId: string, client: EClient) {
	const g = client.settings.get(guildId);
	if (!g) return [];
	return Object.entries(g.schedules).map(([id, s]) => ({ id, s }));
}

export async function handleList(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const { ul, locale } = tFn(
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
	const id = interaction.options.getString(ul("common.id"));
	const parts: Part[] = [];

	if (id) {
		const schedule = schedules.find((s) => s.id === id);
		if (!schedule) {
			return interaction.editReply({
				content: ul("error.invalidScheduleId", { scheduleId: id }),
			});
		}
		const part = formatMessage(
			schedule.s,
			id,
			ul,
			locale,
			interaction,
			client,
			globalSettings,
			true
		);
		parts.push(part);
	} else {
		for (const { id, s } of schedules) {
			const part = formatMessage(s, id, ul, locale, interaction, client, globalSettings);
			parts.push(part);
		}
	}
	const allLines = parts.map((p) => p.lines.join("\n")).join("\n");
	if (allLines.length >= 1090) {
		//send in a message each part
		for (const p of parts) {
			let finalMessages = p.label ? `- ${p.label}\n  - ` : "  - ";
			finalMessages += p.lines.join("\n  - ");
			if (p.upcoming.length > 0) {
				finalMessages += `\n     - ${p.upcoming.join("\n     - ")}`;
			}
			await interaction.followUp({ content: finalMessages });
		}
	} else {
		const message = parts
			.map((p) => {
				let msg = p.label ? ` - ${p.label}\n   - ` : "   - ";
				msg += p.lines.join("\n   - ");
				if (p.upcoming.length > 0) {
					msg += `\n     - ${p.upcoming.join("\n     - ")}`;
				}
				return msg;
			})
			.join("\n\n");
		return interaction.editReply({ content: id ? dedent(message) : message });
	}
}

function formatMessage(
	s: Schedule,
	id: string,
	ul: TFunction,
	locale: string,
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient,
	globalSettings?: DateT,
	unique?: boolean
) {
	const formatDate = DateTime.fromISO(s.anchorISO, { zone: s.start.zone }).toFormat(
		globalSettings?.format ?? "f"
	);
	const part: Part = { label: "", lines: [], upcoming: [] };
	part.label = unique ? "" : `**${id}** ${s.active ? "✅" : "❌"}`;
	part.lines.push(
		`__${ul("list.labels")}__\n     - ${s.labels.map((l) => `\`${l}\``).join("\n     - ")}`,
		`__${ul("list.block")}__ \`${humanizeDuration(s.blockMs, { language: locale })}\``,
		`__${ul("list.len")}__ \`${humanizeDuration(s.lenMs, { language: locale })}\``,
		`__${ul("list.start")}__ \`${s.start.hhmm} (${s.start.zone})\``,
		`__${ul("list.anchor")}__ ${formatDate}`,
		`__${ul("list.location")}__ ${s.locationType === Djs.GuildScheduledEventEntityType.External ? s.location : `<#${s.location}>`}`,
		`__${ul("list.createdBy")}__ <@${s.createdBy}>`
	);
	if (s.description) {
		const descEntries = Object.entries(s.description);
		if (descEntries.length > 0) {
			const descLines = descEntries.map(
				([lbl, txt]) =>
					`\`${lbl}\`: \`${txt.slice(0, 100)}${txt.length > 100 ? "…" : ""}\``
			);
			part.lines.push(
				`__${ul("list.description")}__\n     - ${descLines.join("\n     - ")}`
			);
		}
	}
	if (s.banners) {
		const bannerBits = Object.entries(s.banners)
			.map(([lbl, url]) => `[${lbl}](<${url.url}>)`)
			.join(" | ");
		if (bannerBits || bannerBits.length > 0) {
			part.lines.push(`__${ul("list.banners")}__ ${bannerBits}`);
		}
	}
	const upcoming = listUpcomingEventsForSchedule(interaction.guildId!, id, client, 5).map(
		(ev) => {
			const ts = Math.floor(
				DateTime.fromISO(ev.start.iso, { zone: ev.start.zone }).toSeconds()
			);
			return `\`${ev.label}\` - <t:${ts}:f>`;
		}
	);
	if (upcoming.length) {
		part.lines.push(`__${ul("list.upcomingEvents")}__`);
		for (const u of upcoming) part.upcoming.push(`  ${u}`);
	}
	return part;
}
