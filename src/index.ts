import * as process from "node:process";
import * as Djs from "discord.js";
import dotenv from "dotenv";

import * as pkg from "../package.json";
import { EClient } from "./client";
import interaction from "./events/interaction";
import join from "./events/join";
import ready from "./events/ready";

dotenv.config({ path: ".env" });

export const client = new EClient({
	intents: [
		Djs.GatewayIntentBits.GuildMessages,
		//Djs.GatewayIntentBits.MessageContent,
		Djs.GatewayIntentBits.Guilds,
		//Djs.GatewayIntentBits.GuildMembers,
	],
	partials: [Djs.Partials.Channel, Djs.Partials.GuildMember, Djs.Partials.User],
});

export const VERSION = pkg.version ?? "0.0.0";
export const prod = process.env.NODE_ENV === "production";

try {
	ready(client);
	interaction(client);
	join(client);
} catch (error) {
	console.error(error);
}

client.login(process.env.DISCORD_TOKEN);
