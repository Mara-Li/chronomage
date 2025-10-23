import type { Templates } from "./interface";

export function defaultTemplate(): Templates {
	return {
		date: {
			format: "f",
			timezone: "UTC",
			cron: "0 0 * * *",
			start: new Date().toISOString(),
			step: 1,
			currentValue: new Date().toISOString(),
		},
		count: { start: 1, step: 1, decimal: 4, cron: "0 0 * * *", currentValue: 0 },
		weather: { location: "London" },
	};
}
