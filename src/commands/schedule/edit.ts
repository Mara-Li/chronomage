import * as Djs from "discord.js";
import { DateTime } from "luxon";
import { createEvent } from "@/buffer";
import type { EClient } from "@/client";
import { parseDurationLocalized } from "@/duration";
import { Wizard, wizardKey } from "@/interface";
import { t, tFn } from "@/localization";

export async function handleEdit(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	// Implementation for edit subcommand goes here
	const guildId = interaction.guildId!;
	const { ul, locale } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(guildId)
	);
	const id = interaction.options.getString(t("common.id"), true);

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
		await createEvent(guildId, id, client, interaction, ul);
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

async function handleEditBlocks(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const guildId = interaction.guildId!;
	const scheduleId = interaction.options.getString(t("common.id"), true);
	const blocNumber = interaction.options.getInteger(t("bloc.name"), true);
	const g = client.settings.get(guildId);
	const s = g?.schedules?.[scheduleId];
	if (!s) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: t("error.invalidScheduleId", { scheduleId }),
		});
	}
}
