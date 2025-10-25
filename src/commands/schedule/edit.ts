import * as Djs from "discord.js";
import { DateTime } from "luxon";
import { createEvent } from "@/buffer";
import type { EClient } from "@/client";
import { parseDurationLocalized } from "@/duration";
import { Wizard, wizardKey, type EventRow, type EventKey } from "@/interface";
import { t, tFn } from "@/localization";
import { getLocation } from "./create";
import { startWizardFromSlash } from "./create/wizard";
import humanizeDuration from "humanize-duration";
import { listAllUpcomingForSchedule } from "./list";

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
	if (location || vocalChannel) {
		const locationResult = await getLocation(interaction, ul);
		if (!locationResult) return;
		s.location = locationResult.finalLocation;
		s.locationType = locationResult.locationType;
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

		// If start time, zone, or block duration changed, we need to recreate all future events
		// because their start.iso values are now incorrect
		const needsRecreation = !!(startHHMM || zone || blocStr);

		if (needsRecreation) {
			// Delete all future EventRow and their Discord events
			const now = DateTime.now().setZone(s.start.zone);
			const guild = interaction.guild!;

			for (const [eventKey, eventRow] of Object.entries(g.events)) {
				if (eventRow.scheduleId !== id) continue;
				if (eventRow.status !== "created") continue;

				const eventStart = DateTime.fromISO(eventRow.start.iso, { zone: eventRow.start.zone });
				if (eventStart <= now) continue; // Skip past events

				// Delete the Discord event
				if (eventRow.discordEventId) {
					try {
						const discordEvent = await guild.scheduledEvents.fetch(eventRow.discordEventId);
						if (discordEvent) {
							await discordEvent.delete();
						}
					} catch (err) {
						console.error(`Failed to delete Discord event ${eventRow.discordEventId}:`, err);
					}
				}

				// Delete from our DB
				delete g.events[eventKey as EventKey];
			}
		} else {
			// Only update length and location for existing events
			const now = DateTime.now().setZone(s.start.zone);
			const guild = interaction.guild!;

			for (const [eventKey, eventRow] of Object.entries(g.events)) {
				if (eventRow.scheduleId !== id) continue;
				if (eventRow.status !== "created") continue;

				const eventStart = DateTime.fromISO(eventRow.start.iso, { zone: eventRow.start.zone });
				if (eventStart <= now) continue; // Skip past events

				// Update the snapshot values with new schedule settings
				if (lenStr) {
					eventRow.lenMs = s.lenMs;
				}
				if (location || vocalChannel) {
					eventRow.locationSnapshot = s.location;
					eventRow.locationTypeSnapshot = s.locationType;
				}
				g.events[eventKey as EventKey] = eventRow;

				// Update the Discord event itself if it exists
				if (eventRow.discordEventId) {
					try {
						const discordEvent = await guild.scheduledEvents.fetch(eventRow.discordEventId);
						if (discordEvent) {
							const updateData: Record<string, any> = {};

							if (lenStr) {
								// Update end time based on new length
								const newEnd = DateTime.fromISO(eventRow.start.iso, { zone: eventRow.start.zone })
									.plus({ milliseconds: s.lenMs });
								updateData.scheduledEndTime = newEnd.toJSDate();
							}

							if (location || vocalChannel) {
								const entityType = Number(s.locationType) as Djs.GuildScheduledEventEntityType;
								const needsChannel =
									entityType === Djs.GuildScheduledEventEntityType.Voice ||
									entityType === Djs.GuildScheduledEventEntityType.StageInstance;

								if (entityType === Djs.GuildScheduledEventEntityType.External) {
									updateData.entityMetadata = { location: s.location };
								} else if (needsChannel) {
									updateData.channel = s.location;
								}
							}

							if (Object.keys(updateData).length > 0) {
								await discordEvent.edit(updateData);
							}
						}
					} catch (err) {
						console.error(`Failed to update Discord event ${eventRow.discordEventId}:`, err);
						// Continue with other events even if one fails
					}
				}
			}
		}

		g.schedules[id] = s;
		client.settings.set(guildId, g);

		// Recreate events if needed, or just ensure buffer
		await createEvent(guildId, id, client, interaction, ul);
		const locationTypeStr = s.locationType === Djs.GuildScheduledEventEntityType.External ? s.location : `<#${s.location}>`;
		const bloc = humanizeDuration(s.blockMs, { language: locale });
		await interaction.reply(
			ul("edit.success", {
				id,
				lenStr: humanizeDuration(s.lenMs, { language: locale }),
				start: s.start.hhmm,
				zone: s.start.zone,
				bloc,
				location: locationTypeStr,
			})
		);
	} catch (err) {
		console.error(err);
		return interaction.reply({
			content: ul("errors.unknown", {
				error: err instanceof Error ? err.message : String(err),
			}),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
}

export async function handleEditBlocks(
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
