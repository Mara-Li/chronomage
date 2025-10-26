import * as Djs from "discord.js";
import type { TFunction, TOptions } from "i18next";
import type { EClient } from "@/client";
import { setCount, setDate, setWeather } from "@/cron";
import { CountJobs, DateJobs, WeatherJobs } from "@/interface/constant";
import { t, tFn } from "@/localization";
import { getSettings } from "@/utils";

type Variable = "date" | "count" | "weather" | "all";

export async function pauseTemplateVariable(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction
) {
	const settings = getSettings(client, interaction.guild!, interaction.locale);
	const { ul } = tFn(interaction.locale, interaction.guild!, settings);
	const variables = interaction.options.getString(t("template.name")) as Variable | null;
	if (!variables) return displayStatus(interaction, ul, client);
	switch (variables) {
		case "date": {
			const res = pauseDate(client, interaction, ul);
			return await interaction.reply({
				content: res,
				flags: Djs.MessageFlags.Ephemeral,
			});
		}

		case "count": {
			const res = pauseCount(client, interaction, ul);
			return await interaction.reply({
				content: res,
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
		case "weather": {
			const res = pauseWeather(client, interaction, ul);
			return await interaction.reply({
				content: res,
				flags: Djs.MessageFlags.Ephemeral,
			});
		}
		case "all":
			return await pauseAll(client, interaction, ul);
		default:
			return await displayStatus(interaction, ul, client);
	}
}

async function pauseAll(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	const dateRes = pauseDate(client, interaction, ul);
	const countRes = pauseCount(client, interaction, ul);
	const weatherRes = pauseWeather(client, interaction, ul);
	const finalMessage = `- ${dateRes}\n- ${countRes}\n- ${weatherRes}`;
	return await interaction.reply({
		content: finalMessage,
		flags: Djs.MessageFlags.Ephemeral,
	});
}
function pauseDate(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
): string {
	const settings = getSettings(client, interaction.guild!, interaction.locale);
	const dateTemplate = settings.templates.date;
	if (dateTemplate.stopped) {
		//start it
		setDate(interaction.guild!, client);
		client.settings.set(interaction.guild!.id, false, "templates.date.stopped");
		return ul("template.date.resume");
	}
	const job = DateJobs.get(interaction.guild!.id);
	if (job?.isActive) job.stop();
	client.settings.set(interaction.guild!.id, true, "templates.date.stopped");
	return ul("template.date.pause");
}
function pauseCount(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
): string {
	const count = getSettings(client, interaction.guild!, interaction.locale).templates
		.count;
	if (count.stopped) {
		//start it
		setCount(interaction.guild!, client);
		client.settings.set(interaction.guild!.id, false, "templates.count.stopped");
		return ul("template.count.resume");
	}
	client.settings.set(interaction.guild!.id, true, "templates.count.stopped");
	const job = CountJobs.get(interaction.guild!.id);
	if (job?.isActive) job.stop();
	return ul("template.count.pause");
}

function pauseWeather(
	client: EClient,
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
): string {
	const weather = getSettings(client, interaction.guild!, interaction.locale).templates
		.weather;
	const job = WeatherJobs.get(interaction.guild!.id);
	if (!weather.cron)
		return ul("template.weather.not_set", { variable: ul("weather.name") });
	if (weather.stopped) {
		//doesn't not start if there are no cron set
		const settings = getSettings(client, interaction.guild!, interaction.locale);

		//start it
		//setWeather function is not defined in this context, assuming it's similar to setDate and setCount
		setWeather(interaction.guild!, client);
		client.settings.set(interaction.guild!.id, false, "templates.weather.stopped");
		return ul("template.weather.resume");
	}

	client.settings.set(interaction.guild!.id, true, "templates.weather.stopped");
	if (job?.isActive) job.stop();
	return ul("template.weather.pause");
}

async function displayStatus(
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	client: EClient
) {
	const dateJob = DateJobs.get(interaction.guild!.id);
	const countJob = CountJobs.get(interaction.guild!.id);
	const weatherJob = WeatherJobs.get(interaction.guild!.id);

	const settings = getSettings(client, interaction.guild!, interaction.locale);
	const { date, count, weather } = settings.templates;

	const dateStatus: string = dateJob
		? dateJob.isActive
			? ul("template.pause.enabled")
			: ul("template.pause.disabled")
		: ul("template.pause.disabled");
	const countStatus: string = countJob
		? countJob.isActive
			? ul("template.pause.enabled")
			: ul("template.pause.disabled")
		: ul("template.pause.disabled");
	const weatherStatus: string = weatherJob
		? weatherJob.isActive
			? ul("template.pause.enabled")
			: ul("template.pause.disabled")
		: ul("template.pause.disabled");
	const cronWeather = weather.cron ? ` (\`${weather.cron}\`)` : "";
	const vars = {
		date: {
			value: dateStatus,
			cron: date.cron,
		},
		count: {
			value: countStatus,
			cron: count.cron,
		},
		weather: {
			value: weatherStatus,
			cron: cronWeather,
		},
	};
	return await interaction.reply({
		content: ul("template.pause.status.overall", {
			date: vars.date,
			count: vars.count,
			weather: vars.weather,
		} as unknown as TOptions),
		flags: Djs.MessageFlags.Ephemeral,
	});
}
