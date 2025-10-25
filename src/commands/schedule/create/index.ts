import * as Djs from "discord.js";
import humanId from "human-id";
import { DateTime } from "luxon";
import { computeInitialBlockIndex } from "@/buffer/utils";
import type { EClient } from "@/client";
import { startWizardFromSlash } from "@/commands/schedule/create/wizard";
import { anchorIsoDate } from "@/commands/template/date";
import { parseDurationLocalized } from "@/duration";
import { DEFAULT_ZONE, type EventGuildData, type Schedule } from "@/interface";
import { t, tFn } from "@/localization";
import type { TFunction } from "i18next";

export function createSchedule(
	g: EventGuildData,
	args: {
		guildId: string;
		labels: string[]; // ["A","B"] ou ["A","A","B","B"] etc.
		blocMs: number; // ms
		startHHMM: string; // "21:00"
		lenMs: number; // ms
		anchorISO?: string; // "YYYY-MM-DD"
		createdBy: string;
		zone?: string;
		location: string;
		locationType: Djs.GuildScheduledEventEntityType;
	}
) {
	const zone = args.zone ?? g.settings?.zone ?? DEFAULT_ZONE;
	const anchorISO = args.anchorISO ?? DateTime.now().setZone(zone).toISODate()!;
	const blockMs = args.blocMs;
	const lenMs = args.lenMs;

	const scheduleId = humanId({ separator: "-", capitalize: false });
	const s: Schedule = {
		scheduleId,
		labels: args.labels,
		blockMs,
		start: { hhmm: args.startHHMM, zone },
		lenMs,
		anchorISO,
		nextBlockIndex: computeInitialBlockIndex(anchorISO, blockMs, zone, args.startHHMM),
		active: true,
		createdBy: args.createdBy,
		createdAt: Date.now(),
		location: args.location,
		locationType: args.locationType,
	};

	g.schedules[scheduleId] = s;

	return { scheduleId, schedule: s };
}

export async function handleCreate(
	interaction: Djs.ChatInputCommandInteraction,
	client: EClient
) {
	const { ul, locale } = tFn(
		interaction.locale,
		interaction.guild!,
		client.settings.get(interaction.guild!.id)!
	);
	const total = interaction.options.getInteger(t("count.name"), true);

	const date = client.settings.get(interaction.guild!.id)?.templates.date;
	const zone =
		interaction.options.getString(t("timezone.name")) || date?.timezone || "UTC";

	// Validate inputs here if necessary, e.g., check date formats, timezones, etc.

	const timeData = await getTimes(interaction, ul, locale);
	if (!timeData) return;
	const { blocMs, lenMs, startHHMM } = timeData;
	const anchor = anchorIsoDate(interaction, ul, zone, locale, date);
	if (!anchor) return; //anchorIsoDate already replied with error

	const locationData = await getLocation(interaction, ul);
	if (!locationData) return;
	const { finalLocation, locationType } = locationData;

	const modal = await startWizardFromSlash(interaction, client, {
		total,
		blocMs,
		startHHMM,
		lenMs,
		anchorISO: anchor,
		zone,
		location: finalLocation!,
		locationType,
	});
	return await interaction.showModal(modal);
}

export async function getLocation(
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction
) {
	const location = interaction.options.getString(t("location.string.name"));
	const vocalChannel = interaction.options.getChannel(t("location.vocal.name")) as
		| Djs.VoiceChannel
		| Djs.StageChannel
		| null;
	let finalLocation = location;
	let locationType: Djs.GuildScheduledEventEntityType | null = null; //
	if (location && vocalChannel) {
		await interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.locationConflict"),
		});
		return false;
	}
	if (vocalChannel?.isVoiceBased()) {
		finalLocation = vocalChannel.id;
		//get if the channel is a stage or voice
		if (vocalChannel instanceof Djs.StageChannel) {
			locationType = Djs.GuildScheduledEventEntityType.StageInstance;
		} else locationType = Djs.GuildScheduledEventEntityType.Voice;
	} else if (location) locationType = Djs.GuildScheduledEventEntityType.External;

	if (!locationType) {
		await interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.noLocation"),
		});
		return false;
	}
	return { finalLocation: finalLocation!, locationType };
}

export async function getTimes(
	interaction: Djs.ChatInputCommandInteraction,
	ul: TFunction,
	locale: string
) {
	const blocStr = interaction.options.getString(t("bloc.name"), true);
	const startHHMM = interaction.options.getString(t("common.start"), true);
	const lenStr = interaction.options.getString(t("common.len"), true);
	const blocMs = parseDurationLocalized(blocStr, locale);
	const lenMs = parseDurationLocalized(lenStr, locale);
	if (!blocMs || blocMs <= 0) {
		await interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidBlock", { blocStr }),
		});
		return false;
	}
	if (!lenMs || lenMs <= 0) {
		await interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidLength", { lenStr }),
		});
		return false;
	}
	//validate time with regex HH:MM
	if (!/^\d{2}:\d{2}$/.test(startHHMM)) {
		await interaction.reply({
			flags: Djs.MessageFlags.Ephemeral,
			content: ul("error.invalidStartTime", { startHHMM }),
		});
		return false;
	}
	return { blocMs, lenMs, startHHMM };
}
