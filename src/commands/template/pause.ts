import type * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "@/client";
import { tFn } from "@/localization";
import { getSettings } from "@/utils";
import { CountJobs, DateJobs } from "../../interfaces/constant";

type Variable = "date" | "count" | "weather" | "all";

export function pauseTemplateVariable(
	client: EClient,
	variable: Variable,
	interaction: Djs.ChatInputCommandInteraction
) {
	const settings = getSettings(client, interaction.guild!, interaction.locale);
	const { ul } = tFn(interaction.locale, interaction.guild!, settings);
	const variables = interaction.options.getString("template.name") as Variable | null;
}

function pauseDate(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	const job = DateJobs.get(interaction.guild!.id);
	if (!job)
		return interaction.reply({
			content: ul("template.pause.date.nojob"),
			ephemeral: true,
		});

	if (job.isActive) {
		job.stop();
		interaction.reply({
			content: ul("template.pause.date.success"),
			ephemeral: true,
		});
	} else {
		job.start();
		interaction.reply({
			content: ul("template.date.resume.success"),
			ephemeral: true,
		});
	}
}

function displayStatus(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	const dateJob = DateJobs.get(interaction.guild!.id);
	const countJob = CountJobs.get(interaction.guild!.id);
	const dateStatus = dateJob
		? dateJob.isActive
			? ul("template.pause.enabled")
			: ul("template.pause.disabled")
		: ul("common.not_set");
	const countStatus = countJob
		? countJob.isActive
			? ul("template.pause.enabled")
			: ul("template.pause.disabled")
		: ul("common.not_set");
}
