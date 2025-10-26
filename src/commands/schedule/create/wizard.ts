import * as Djs from "discord.js";
import { DateTime } from "luxon";
import { createEvent } from "@/buffer";
import type { EClient } from "@/client";
import { createSchedule } from "@/commands/schedule/create";
import { buildScheduleModal, buttonFollow } from "@/commands/schedule/create/modal";
import type { BannerSpec, EventKey, Schedule, WizardOptions } from "@/interface";
import { Wizard, wizardKey } from "@/interface/constant";
import { tFn } from "@/localization";
import { getBannerHash, getSettings } from "@/utils";

export function startWizardFromSlash(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient,
	opts: WizardOptions,
	old?: Schedule
) {
	const guildId = interaction.guildId!;
	const userId = interaction.user.id;

	const { ul } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(guildId)
	);

	// Prepare labels array with correct size, pre-filled with old values if editing
	const labels: string[] = Array(opts.total).fill("");
	if (old?.labels) {
		// Copy old labels up to the minimum of old length and new total
		const copyCount = Math.min(old.labels.length, opts.total);
		for (let i = 0; i < copyCount; i++) {
			labels[i] = old.labels[i];
		}
	}

	Wizard.set(wizardKey(guildId, userId), {
		guildId,
		userId,
		total: opts.total,
		current: 1,
		base: {
			blocMs: opts.blocMs,
			startHHMM: opts.startHHMM,
			lenMs: opts.lenMs,
			anchorISO: opts.anchorISO,
			zone: opts.zone,
		},
		labels: labels,
		descriptions: old?.description ? { ...old.description } : {},
		createdBy: userId,
		startedAt: Date.now(),
		location: opts.location,
		locationType: opts.locationType,
		banners: old?.banners ? old.banners : {},
		editingScheduleId: old?.scheduleId, // Mark as editing if old schedule exists
	});

	return buildScheduleModal(interaction.guild!, userId, 1, ul, old);
}

export async function altWizardCancel(
	interaction: Djs.ButtonInteraction,
	client: EClient
) {
	const [, guildId, userId] = interaction.customId.split(":");

	const { ul } = tFn(
		interaction.locale,
		interaction.guild!,
		getSettings(client, interaction.guild!, interaction.locale)
	);
	const state = Wizard.get(wizardKey(guildId, userId));
	if (!state || interaction.user.id !== userId || interaction.guildId !== guildId) {
		await interaction.reply({
			content: ul("error.wizardNotFound"),
			flags: Djs.MessageFlags.Ephemeral,
		});
		return;
	}

	Wizard.delete(wizardKey(guildId, userId));
	await interaction.reply({
		content: ul("modals.canceled"),
		flags: Djs.MessageFlags.Ephemeral,
	});
}

export async function altScheduleWizard(
	interaction: Djs.ModalSubmitInteraction,
	client: EClient
) {
	try {
		const ul = tFn(
			interaction.locale,
			interaction.guild!,
			getSettings(client, interaction.guild!, interaction.locale)
		).ul;

		const [, guildId, userId, _index] = interaction.customId.split(":");

		if (interaction.guildId !== guildId || interaction.user.id !== userId) {
			await interaction.editReply({
				content: ul("error.unauthorized"),
			});
			return;
		}

		const state = Wizard.get(wizardKey(guildId, userId));
		if (!state) {
			await interaction.reply({
				content: ul("eerror.wizardNotFound),,,
			});
			return;
		}

		// 1. récupérer ce que l'utilisateur vient d'envoyer dans ce modal
		const label = interaction.fields.getTextInputValue("label").trim();
		const description = interaction.fields.fields.get("description")
			? interaction.fields.getTextInputValue("description").trim()
			: "";
		const att = getBannerHash(interaction); // si t'as une bannière

		// 2. maj du wizard state
		// Use current-1 as index (current is 1-based)
		const currentIndex = state.current - 1;
		const oldLabel = state.labels[currentIndex]; // Get the old label before replacing

		// Check if this label is already used in another slot
		const duplicateIndex = state.labels.findIndex(
			(l, idx) => l === label && idx !== currentIndex
		);
		if (duplicateIndex !== -1) {
			await interaction.editReply({
				content: ul("error.duplicateLabel", { label, index: duplicateIndex + 1 }),
			});
			return;
		}

		// If we're replacing a label, clean up old description and banner
		if (oldLabel && oldLabel !== label) {
			delete state.descriptions[oldLabel];
			delete state.banners[oldLabel];
		}

		state.labels[currentIndex] = label; // Replace instead of push
		if (description.length) state.descriptions[label] = description;
		if (att) state.banners[label] = att;
		state.current += 1;

		console.log(`[Wizard Debug] Step ${currentIndex + 1}/${state.total}:`);
		console.log(`  Label: "${label}"`);
		console.log(`  Description: "${description}"`);
		console.log("  Current descriptions:", JSON.stringify(state.descriptions, null, 2));

		Wizard.set(wizardKey(guildId, userId), state); // 3. S'il reste des étapes => on s'arrête là, on renvoie le bouton "Suivant"
		if (state.current <= state.total) {
			return await interaction.reply({
				content: ul("modals.scheduleEvent.nextPrompt", {
					current: state.current - 1,
					total: state.total,
					label,
				}),
				components: buttonFollow(guildId, userId, ul),
			});
		}

		// 4. Sinon on est à la dernière étape : on enregistre le schedule en base
		const { blocMs, startHHMM, lenMs, anchorISO, zone } = state.base;
		const labels = state.labels;

		const g = client.settings.get(guildId)!;

		let scheduleId: string;

		// Check if we're editing an existing schedule
		if (state.editingScheduleId) {
			scheduleId = state.editingScheduleId;
			const existingSchedule = g.schedules[scheduleId];

			if (!existingSchedule) {
				await interaction.reply({
					content: ul("error.invalidScheduleId", { scheduleId }),
				});
				Wizard.delete(wizardKey(guildId, userId));
				return;
			}

			// Delete all future events for this schedule since we're changing the blocks
			const now = DateTime.now().setZone(zone ?? existingSchedule.start.zone);
			const guild = interaction.guild!;

			for (const [eventKey, eventRow] of Object.entries(g.events)) {
				if (eventRow.scheduleId !== scheduleId) continue;
				if (eventRow.status !== "created") continue;

				const eventStart = DateTime.fromISO(eventRow.start.iso, {
					zone: eventRow.start.zone,
				});
				if (eventStart <= now) continue;

				// Delete the Discord event
				if (eventRow.discordEventId) {
					try {
						const discordEvent = await guild.scheduledEvents.fetch(
							eventRow.discordEventId
						);
						if (discordEvent) {
							await discordEvent.delete();
						}
					} catch (err) {
						console.error(
							`Failed to delete Discord event ${eventRow.discordEventId}:`,
							err
						);
					}
				}

				// Delete from our DB
				delete g.events[eventKey as EventKey];
			}

			// Clean up descriptions and banners for labels that no longer exist
			const cleanedDescriptions: Record<string, string> = {};
			const cleanedBanners: Record<string, BannerSpec> = {};

			for (const label of labels) {
				if (state.descriptions[label]) {
					cleanedDescriptions[label] = state.descriptions[label];
				}
				if (state.banners[label]) {
					cleanedBanners[label] = state.banners[label];
				}
			}

			// Update the existing schedule with new data
			g.schedules[scheduleId] = {
				...existingSchedule,
				labels,
				blockMs: blocMs,
				start: { hhmm: startHHMM, zone: zone ?? existingSchedule.start.zone },
				lenMs,
				anchorISO: anchorISO ?? existingSchedule.anchorISO,
				nextBlockIndex: 0, // Reset to recreate events
				location: state.location,
				locationType: state.locationType,
				description: cleanedDescriptions,
				banners: cleanedBanners,
			};
		} else {
			// Create a new schedule
			const result = createSchedule(g, {
				guildId,
				labels,
				blocMs,
				startHHMM,
				lenMs,
				anchorISO,
				createdBy: state.userId,
				zone,
				location: state.location,
				locationType: state.locationType,
			});
			scheduleId = result.scheduleId;

			// Clean up descriptions and banners for labels that no longer exist
			const cleanedDescriptions: Record<string, string> = {};
			const cleanedBanners: Record<string, BannerSpec> = {};

			for (const label of labels) {
				if (state.descriptions[label]) {
					cleanedDescriptions[label] = state.descriptions[label];
				}
				if (state.banners[label]) {
					cleanedBanners[label] = state.banners[label];
				}
			}

			// Add descriptions and banners
			g.schedules[scheduleId] = {
				...g.schedules[scheduleId],
				description: cleanedDescriptions,
				banners: cleanedBanners,
			};
		}

		client.settings.set(guildId, g);

		// 5. on clôture le wizard ici
		Wizard.delete(wizardKey(guildId, userId));

		// 6. on répond direct à l'utilisateur, sans lancer ensureBufferForGuild maintenant
		const isEditing = !!state.editingScheduleId;
		await interaction.reply({
			content: isEditing
				? ul("modals.scheduleEvent.edited", { scheduleId })
				: ul("modals.scheduleEvent.completedQuick", { scheduleId }),
		});

		// fin. pas d'appel lourd ici.
		await createEvent(guildId, scheduleId, client, interaction, ul);
	} catch (err) {
		console.error("[altScheduleWizard] error at final step:", err);

		if (!interaction.replied && !interaction.deferred) {
			try {
				await interaction.reply({
					content: "Une erreur est survenue, l'événement n'a pas été planifié.",
					flags: Djs.MessageFlags.Ephemeral,
				});
			} catch {
				// ignore
			}
		}
	}
}

export async function altWizardNext(interaction: Djs.ButtonInteraction, client: EClient) {
	const [, guildId, userId] = interaction.customId.split(":");
	const guild = interaction.guild;
	await interaction.message.edit({ components: [] }); // remove buttons

	const { ul } = tFn(
		interaction.locale,
		guild!,
		getSettings(client, guild!, interaction.locale)
	);
	const state = Wizard.get(wizardKey(guildId, userId));
	if (!state || interaction.user.id !== userId || interaction.guildId !== guildId) {
		await interaction.reply({
			content: ul("eerror.wizardNotFound),
			flags: Djs.MessageFlags.Ephemeral,,,
		});
		return;
	}

	// If we're editing, get the original schedule to show old values
	let oldSchedule: Schedule | undefined;
	if (state.editingScheduleId) {
		const g = client.settings.get(guildId);
		oldSchedule = g?.schedules?.[state.editingScheduleId];
	}

	await interaction.showModal(
		await buildScheduleModal(interaction.guild!, userId, state.current, ul, oldSchedule)
	);
}
