import * as process from "node:process";
import * as Djs from "discord.js";
import dotenv from "dotenv";
import { EClient } from "@/client";
import "uniformize";
import * as pkg from "../package.json";
import { interaction, join, onGuildScheduledEventCreate, onQuit, ready } from "./events";
import {
	onChannelCreate,
	onChannelDelete,
	onChannelUpdate,
} from "./events/channelUpdate";

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
		Djs.Partials.Channel,
	],
});

export const VERSION = pkg.version ?? "0.0.0";

try {
	ready(client);
	interaction(client);
	join(client);
	onQuit(client);
	onGuildScheduledEventCreate(client);
	onChannelCreate(client);
	onChannelUpdate(client);
	onChannelDelete(client);
} catch (error) {
	console.error(error);
}

client.login(process.env.DISCORD_TOKEN).then((token) => {
	console.log(`Logged in with token ${token.substring(0, 10)}...`);
});
