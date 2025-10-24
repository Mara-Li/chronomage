import type * as Djs from "discord.js";
import { DateTime, Duration } from "luxon";
import type { EClient } from "../client";
import * as count from "../commands/template/count";
import * as date from "../commands/template/date";
import * as weather from "../commands/template/weather";
import { type Schedule, TEMPLATES } from "../interface";

function computeInitialBlockIndex(anchorISO: string, blockMs: number, zone: string) {
	const anchor = DateTime.fromISO(anchorISO, { zone }).startOf("day");
	const now = DateTime.now().setZone(zone);
	const diff = Math.max(0, now.toMillis() - anchor.toMillis());
	return Math.floor(diff / blockMs);
}

function blockStartAt(s: Schedule, blockIndex: number): DateTime {
	const anchor = DateTime.fromISO(s.anchorISO, { zone: s.start.zone }).startOf("day");
	const block = Duration.fromMillis(s.blockMs);
	const base = anchor.plus(block.mapUnits((v) => v * blockIndex));
	const [hh, mm] = s.start.hhmm.split(":").map(Number);
	return base.set({ hour: hh ?? 21, minute: mm ?? 0, second: 0, millisecond: 0 });
}

function labelAt(s: Schedule, blockIndex: number) {
	const i = ((blockIndex % s.labels.length) + s.labels.length) % s.labels.length;
	return s.labels[i];
}

async function processTemplate(text: string, client: EClient, guild: Djs.Guild) {
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
				result = date.processTemplate(client, guild, result);
				continue;

			case TEMPLATES.count:
				result = count.processTemplate(client, guild, result);
				continue;

			case TEMPLATES.weather.emoji:
			case TEMPLATES.weather.short:
			case TEMPLATES.weather.long:
				result = await weather.processTemplate(client, guild, result);
		}
	}

	return result;
}

export { computeInitialBlockIndex, blockStartAt, labelAt, processTemplate };
