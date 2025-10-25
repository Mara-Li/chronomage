import * as process from "node:process";
import * as Djs from "discord.js";
import dotenv from "dotenv";

import * as pkg from "../package.json";
import { EClient } from "./client";
import interaction from "./events/interaction";
import join from "./events/join";
import ready from "./events/ready";
import "uniformize";
import onGuildScheduledEventCreate from "./events/guildScheduledEventUpdate";
import onQuit from "./events/onQuit";

dotenv.config({ path: ".env" });

export const client = new EClient({
	intents: [
		Djs.GatewayIntentBits.GuildMessages,
		//Djs.GatewayIntentBits.MessageContent,
		Djs.GatewayIntentBits.Guilds,
		//Djs.GatewayIntentBits.GuildMembers,
		Djs.GatewayIntentBits.GuildScheduledEvents,
	],
	partials: [
		Djs.Partials.Channel,
		Djs.Partials.GuildMember,
		Djs.Partials.User,
		Djs.Partials.GuildScheduledEvent,
	],
});

export const VERSION = pkg.version ?? "0.0.0";

try {
	ready(client);
	interaction(client);
	join(client);
	onQuit(client);
	onGuildScheduledEventCreate(client);
} catch (error) {
	console.error(error);
}

client.login(process.env.DISCORD_TOKEN).then((token) => {
	console.log(`Logged in with token ${token.substring(0, 10)}...`);
});
