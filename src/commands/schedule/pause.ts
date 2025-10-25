import * as Djs from "discord.js";
import type { EClient } from "@/client";
import { t, tFn } from "@/localization";

export async function handlePause(
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
function setScheduleActive(
	guildId: string,
	scheduleId: string,
	active: boolean,
	client: EClient
) {
	const g = client.settings.get(guildId);
	if (!g) return false;
	const s = g.schedules[scheduleId];
	if (!s) return false;
	s.active = active;
	client.settings.set(guildId, g);
	return true;
}
