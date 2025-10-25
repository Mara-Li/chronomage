import * as Djs from "discord.js";
import type { EClient } from "@/client";
import { t, tFn } from "@/localization";
import { getSettings } from "@/utils";

export async function deleteSchedule(
	guild: Djs.Guild,
	scheduleId: string,
	client: EClient
) {
	const g = getSettings(client, guild, Djs.Locale.EnglishUS);
	if (!g?.schedules[scheduleId]) return false;

	delete g.schedules[scheduleId];

	for (const k of Object.keys(g.events)) {
		const key = k as keyof typeof g.events;
		const event = g.events[key];
		// Ne toucher qu'aux événements qui appartiennent au scheduleId ciblé
		if (event.scheduleId !== scheduleId) continue;

		// Si l'événement a été créé sur Discord, supprimer uniquement celui-ci
		if (event.discordEventId) {
			try {
				// fetch() pour s'assurer d'obtenir l'événement même s'il n'est pas en cache
				const ev = await guild.scheduledEvents.fetch(event.discordEventId);
				await ev?.delete();
			} catch (err) {
				//pass
			}
		}

		// Supprimer l'event des données locales
		delete g.events[key];
	}

	client.settings.set(guild.id, g);
	return true;
}

export async function cancelAll(guild: Djs.Guild, client: EClient) {
	const allEventsInDiscord = await guild.scheduledEvents.fetch();
	const promises = allEventsInDiscord.map((ev) => ev.delete());
	await Promise.all(promises);
	const g = getSettings(client, guild, Djs.Locale.EnglishUS);
	if (!g) return;
	g.schedules = {};
	g.events = {};
	client.settings.set(guild.id, g);
}

export async function handleCancel(
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
