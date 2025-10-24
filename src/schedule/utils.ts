import { DateTime, Duration } from "luxon";
import type { Schedule } from "../interface";

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

export { computeInitialBlockIndex, blockStartAt, labelAt };
