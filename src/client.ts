import * as Djs from "discord.js";
import Enmap from "enmap";
import type { EventGuildData } from "./interface";
export class EClient extends Djs.Client {
	public settings: Enmap<string, EventGuildData, unknown>;

	constructor(options: Djs.ClientOptions) {
		super(options);
		this.settings = new Enmap({
			name: "settings",
			fetchAll: false,
			autoFetch: true,
			cloneLevel: "deep",
		});
	}
}
