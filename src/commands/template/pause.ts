import * as Djs from "discord.js";
import type { TFunction } from "i18next";
import type { EClient } from "@/client";
import { setCount, setDate, setWeather } from "@/cron";
import { CountJobs, DateJobs, WeatherJobs } from "@/interface/constant";
import { tFn } from "@/localization";
import { getSettings } from "@/utils";

type Variable = "date" | "count" | "weather" | "all";

export function pauseTemplateVariable(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction
) {
	const settings = getSettings(client, interaction.guild!, interaction.locale);
	const { ul } = tFn(interaction.locale, interaction.guild!, settings);
	const variables = interaction.options.getString("template.name") as Variable | null;
	if (!variables) return displayStatus(interaction, ul);
	switch (variables) {
		case "date":
			return pauseDate(client, interaction, ul);
		case "count":
			return pauseCount(client, interaction, ul);
		case "weather":
			return pauseWeather(client, interaction, ul);
		case "all":
			pauseDate(client, interaction, ul);
			pauseCount(client, interaction, ul);
			pauseWeather(client, interaction, ul);
			return;
		default:
			return displayStatus(interaction, ul);
	}
}

async function pauseDate(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	const job = DateJobs.get(interaction.guild!.id);
	if (!job) {
		//start it
		setDate(interaction.guild!, client);
		return await interaction.reply({
			content: ul("template.date.resume"),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
	if (job.isActive) {
		job.stop();
		return await interaction.reply({
			content: ul("template.date.pause"),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
	job.start();
	return await interaction.reply({
		content: ul("template.date.resume"),
		flags: Djs.MessageFlags.Ephemeral,
	});
}

async function pauseCount(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	const job = CountJobs.get(interaction.guild!.id);
	if (!job) {
		//start it
		setCount(interaction.guild!, client);
		return await interaction.reply({
			content: ul("template.count.resume"),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
	if (job.isActive) {
		job.stop();
		return await interaction.reply({
			content: ul("template.count.pause"),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
	job.start();
	return await interaction.reply({
		content: ul("template.count.resume"),
		flags: Djs.MessageFlags.Ephemeral,
	});
}

async function pauseWeather(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	const job = WeatherJobs.get(interaction.guild!.id);
	if (!job) {
		//doesn't not start if there are no cron set
		const settings = getSettings(client, interaction.guild!, interaction.locale);
		if (!settings.templates.weather.cron) {
			return await interaction.reply({
				content: ul("template.weather.not_set", { variable: ul("weather.name") }),
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
		//start it
		//setWeather function is not defined in this context, assuming it's similar to setDate and setCount
		setWeather(interaction.guild!, client);
		return await interaction.reply({
			content: ul("template.weather.resume"),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
	if (job.isActive) {
		job.stop();
		return await interaction.reply({
			content: ul("template.weather.pause"),
			flags: Djs.MessageFlags.Ephemeral,
		});
	}
	job.start();
	return await interaction.reply({
		content: ul("template.weather.resume"),
		flags: Djs.MessageFlags.Ephemeral,
	});
}

function displayStatus(interaction: Djs.ChatInputCommandInteraction, ul: TFunction) {
	const dateJob = DateJobs.get(interaction.guild!.id);
	const countJob = CountJobs.get(interaction.guild!.id);
	const weatherJob = WeatherJobs.get(interaction.guild!.id);
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
	const weatherStatus = weatherJob
		? weatherJob.isActive
			? ul("template.pause.enabled")
			: ul("template.pause.disabled")
		: ul("common.not_set");
	return interaction.reply({
		content: ul("template.pause.status.overall", {
			date: {
				value: dateStatus,
				cron: dateJob ? dateJob.cronTime.source : ul("common.not_set"),
			},
			count: {
				value: countStatus,
				cron: countJob ? countJob.cronTime.source : ul("common.not_set"),
			},
			weather: {
				value: weatherStatus,
				cron: weatherJob ? weatherJob.cronTime.source : ul("common.not_set"),
			},
		}),
		flags: Djs.MessageFlags.Ephemeral,
	});
}
