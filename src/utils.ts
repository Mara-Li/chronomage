import type { Templates } from "./interface";

export function defaultTemplate(): Templates {
	return {
		date: {
			format: "DD/MM/YYYY",
			timezone: "UTC",
			cron: "0 0 * * *",
			start: new Date().toISOString(),
			step: 1,
		},
		count: { start: 1, step: 1, decimal: 4, cron: "0 0 * * *" },
		weather: { location: "London", cron: "0 6 * * *" },
	};
}
