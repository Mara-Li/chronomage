import process from "node:process";
import { CronJob } from "cron";
import dotenv from "dotenv";
import { ensureBufferForGuild } from "@/buffer";
import type { EClient } from "@/client";
import { commandsList } from "@/commands";
import { initAll } from "@/cron";
import { VERSION } from "@/root";

dotenv.config({ path: ".env", quiet: true });

export default (client: EClient): void => {
	client.on("clientReady", async () => {
		if (!client.user || !client.application || !process.env.CLIENT_ID) return;

		console.info(`${client.user.username} is online; v.${VERSION}`);
		const serializedCommands = commandsList.map((command) => command.data.toJSON());

		// Register commands for all guilds concurrently
		const guilds = Array.from(client.guilds.cache.values());
		if (guilds.length === 0) {
			console.info("No data guilds found to register commands.");
			return;
		}

		console.info(`Registering commands on ${guilds.length} servers...`);
		if (process.env.NODE_ENV === "production")
			// Register global commands in production
			await client.application.commands.set(serializedCommands);

		const guildPromises = guilds.map(async (guild) => {
			try {
				if (process.env.NODE_ENV !== "production") {
					console.info(`[${guild.name}] Commands synchronisation...`);
					await guild.commands.set(serializedCommands);
					console.info(`[${guild.name}] OK (${serializedCommands.length} commands).`);
				}
				initAll(guild, client);
			} catch (error) {
				console.error(`[${guild.name}] Failure during commands registration:`, error);
			}
		});

		// Execute all promises in parallel
		await Promise.all(guildPromises);
		console.info("All guilds registered.");
		//create a cron job that runs every 5 minute to check all guilds
		new CronJob(
			"*/5 * * * *",
			async () => {
				for (const guild of client.guilds.cache.values()) {
					try {
						await ensureBufferForGuild(client, guild.id);
					} catch (err) {
						console.error(`[${guild.name}] ensureBufferForGuild error:`, err);
					}
				}
			},
			null,
			true
		).start();
	});
};
