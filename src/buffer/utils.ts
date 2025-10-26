import type * as Djs from "discord.js";
import { DateTime, Duration } from "luxon";
import type { EClient } from "@/client";
import type { Schedule } from "@/interface";
import * as count from "../commands/template/count";
import * as date from "../commands/template/date";
import * as weather from "../commands/template/weather";
import { TEMPLATES } from "../interfaces/constant";

function computeInitialBlockIndex(
	anchorISO: string,
	blockMs: number,
	zone: string,
	startHHMM: string
) {
	const [hh, mm] = startHHMM.split(":").map(Number);
	const firstStart = DateTime.fromISO(anchorISO, { zone }).set({
		hour: hh ?? 0,
		minute: mm ?? 0,
		second: 0,
		millisecond: 0,
	});

	const now = DateTime.now().setZone(zone);

	const diffMs = Math.max(0, now.toMillis() - firstStart.toMillis());
	return Math.floor(diffMs / blockMs);
}

function blockStartAt(s: Schedule, blockIndex: number): DateTime {
	const anchor = DateTime.fromISO(s.anchorISO, { zone: s.start.zone }).startOf("day");
	const block = Duration.fromMillis(s.blockMs);
	const base = anchor.plus(block.mapUnits((v) => v * blockIndex));
	const [hh, mm] = s.start.hhmm.split(":").map(Number);
	return base.set({ hour: hh ?? 0, minute: mm ?? 0, second: 0, millisecond: 0 });
}

function labelAt(s: Schedule, blockIndex: number) {
	const i = ((blockIndex % s.labels.length) + s.labels.length) % s.labels.length;
	return s.labels[i];
}

async function processTemplate(
	text: string,
	client: EClient,
	guild: Djs.Guild,
	start = false
): Promise<string> {
	function getAllValues(obj: Record<string, any>): any[] {
		return Object.values(obj).flatMap((v) =>
			typeof v === "object" && !(v instanceof RegExp) ? getAllValues(v) : [v]
		);
	}

	const templates: RegExp[] = getAllValues(TEMPLATES);
	let result = text;
	for (const tpl of templates) {
		switch (tpl) {
			case TEMPLATES.date:
				result = date.processTemplate(client, guild, result, start);
				continue;

			case TEMPLATES.count:
				result = count.processTemplate(client, guild, result, start);
				continue;

			case TEMPLATES.weather.emoji:
			case TEMPLATES.weather.short:
			case TEMPLATES.weather.long:
				result = await weather.processTemplate(client, guild, result, start);
		}
	}

	return result;
}

export { computeInitialBlockIndex, blockStartAt, labelAt, processTemplate };
