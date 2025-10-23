import * as Djs from "discord.js";
import Enmap, { type EnmapOptions } from "enmap";
import type { RecurringEvent, Templates } from "./interface";
export class EClient extends Djs.Client {
	public variables: Enmap<string, Templates>;
	public reccuringEvents: Enmap<string, RecurringEvent>;

	constructor(options: Djs.ClientOptions) {
		super(options);

		const enmapSettings: EnmapOptions<string, Templates> = {
			name: "variables",
		};

		this.variables = new Enmap({
			name: "variables",
		});
		this.reccuringEvents = new Enmap({
			name: "recurringEvents",
		});
	}
}
