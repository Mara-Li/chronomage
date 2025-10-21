import process from "node:process";
import type { Client } from "discord.js";
import dotenv from "dotenv";
import { VERSION } from "src";
import { commandsList } from "src/commands";

dotenv.config({ path: ".env" });

export default (client: Client): void => {
	client.on("clientReady", async () => {
		if (!client.user || !client.application || !process.env.CLIENT_ID) return;

		console.info(`${client.user.username} is online; v.${VERSION}`);
		const serializedCommands = commandsList.map((command) =>
			command.data.toJSON(),
		);

		// Register commands for all guilds concurrently
		await Promise.all(
			[...client.guilds.cache.values()].map(async (guild) => {
				console.log(`Registering commands for ${guild.name}`);
				await guild.commands.set(serializedCommands);
			}),
		);
	});
};
