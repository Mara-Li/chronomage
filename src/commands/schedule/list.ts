import dedent from "dedent";
import * as Djs from "discord.js";
import { DateTime } from "luxon";
import type { EClient } from "@/client";
import { tFn } from "@/localization";
import humanizeDuration from "humanize-duration";

function listUpcomingEventsForSchedule(guildId: string, scheduleId: string, client: EClient, limit = 5) {
	return listAllUpcomingForSchedule(guildId, scheduleId, client).slice(0, limit);
}

export function listAllUpcomingForSchedule(guildId: string, scheduleId: string, client: EClient) {
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
	const parts: { label: string; lines: string[], upcoming: string[] }[] = [];
	for (const { id, s } of schedules) {
		const formatDate = DateTime.fromISO(s.anchorISO, { zone: s.start.zone }).toFormat(
			globalSettings?.format ?? "f"
		);
		const part: { label: string; lines: string[], upcoming: string[] } = { label: "", lines: [], upcoming: [] };
		part.label = `**${id}** ${s.active ? "✅" : "❌"}`;
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
			const descBits = Object.entries(s.description)
				.map(
					([lbl, txt]) =>
						`\`${lbl}\`: \`${txt.slice(0, 60)}${txt.length > 60 ? "…" : ""}\``
				)
				.join(" | ");
			if (descBits || descBits.length > 0) {
				part.lines.push(`__${ul("list.description")}__ ${descBits}`);
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
		parts.push(part);
	}
	const allLines = parts.map((p) => p.lines.join("\n")).join("\n");
	if (allLines.length >= 1090) {
		//send in a message each part
		for (const p of parts) {
			const finalMesssages = `- ${p.label}\n  - ${p.lines.join("\n  - ")}\n     - ${p.upcoming.join("\n     - ")}`;
			await interaction.followUp({ content: finalMesssages });
		}
	} else {
		const message = dedent`${parts
			.map((p) => ` - ${p.label}\n   - ${p.lines.join("\n   - ")}\n     - ${p.upcoming.join("\n     - ")}`)
			.join("\n\n")}`;
		return interaction.editReply({ content: message });
	}
}
