import * as Djs from "discord.js";
import { DateTime } from "luxon";
import { createEvent } from "@/buffer";
import type { EClient } from "@/client";
import { parseDurationLocalized } from "@/duration";
import { Wizard, wizardKey } from "@/interface";
import { t, tFn } from "@/localization";
import { getLocation } from "./create";
import { startWizardFromSlash } from "./create/wizard";

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
	const blocStr = interaction.options.getString(t("bloc.name"));
	const location = interaction.options.getString(t("location.string.name"));
	const vocalChannel = interaction.options.getChannel(t("location.vocal.name")) as
		| Djs.VoiceChannel
		| Djs.StageChannel
		| null;
	let finalLocation = s.location;
	if (location || vocalChannel) {
		const locationResult = await getLocation(interaction, ul);
		if (!locationResult) return;
		s.location = locationResult.finalLocation;
		s.locationType = locationResult.locationType;
		finalLocation = locationResult.finalLocation;
	}
	try {
		if (lenStr) {
			const lenMs = parseDurationLocalized(lenStr, locale);
			if (!lenMs || lenMs <= 0) {
				return await interaction.reply({
					flags: Djs.MessageFlags.Ephemeral,
					content: ul("error.invalidLength", { lenStr }),
				});
			}
			s.lenMs = lenMs;
		}
		if (startHHMM) {
			if (!/^\d{2}:\d{2}$/.test(startHHMM)) {
				await interaction.reply({
					flags: Djs.MessageFlags.Ephemeral,
					content: ul("error.invalidStartTime", { startHHMM }),
				});
				return false;
			}
			s.start.hhmm = startHHMM;
		}
		if (blocStr) {
			const blocMs = parseDurationLocalized(blocStr, locale);
			if (!blocMs || blocMs <= 0) {
				return await interaction.reply({
					flags: Djs.MessageFlags.Ephemeral,
					content: ul("error.invalidLength", { lenStr }),
				});
			}
			s.blockMs = blocMs;
		}
		if (zone) s.start.zone = zone;
		s.nextBlockIndex = 0;

		g.schedules[id] = s;
		client.settings.set(guildId, g);
		await createEvent(guildId, id, client, interaction, ul);
		const unchanged = ul("common.noChange");

		await interaction.editReply(
			ul("edit.success", {
				id,
				lenStr: lenStr ?? unchanged,
				startHHMM: startHHMM ?? unchanged,
				zone: zone ?? unchanged,
				blocStr: blocStr ?? unchanged,
				location: finalLocation ?? unchanged,
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
	const g = client.settings.get(guildId);
	const nbToCreate = interaction.options.getInteger(t("count.name"));
	const s = g?.schedules?.[scheduleId];
	if (!s) {
		return interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: t("error.invalidScheduleId", { scheduleId }),
		});
	}
	const modal = await startWizardFromSlash(interaction, client, {
		total: nbToCreate ?? s.labels.length ?? 1,
		blocMs: s.blockMs,
		startHHMM: s.start.hhmm,
		lenMs: s.lenMs,
		anchorISO: s.anchorISO,
		zone: s.start.zone,
		location: s.location,
		locationType: s.locationType,
	}, s);
	return await interaction.showModal(modal);

}
