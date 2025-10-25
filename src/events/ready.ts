import process from "node:process";
import { CronJob } from "cron";
import dotenv from "dotenv";
import { VERSION } from "..";
import type { EClient } from "../client";
import { commandsList } from "../commands";
import { initAll } from "../cron";
import { ensureBufferForGuild } from "../schedule/buffer";

dotenv.config({ path: ".env" });

export default (client: EClient): void => {
	client.on("clientReady", async () => {
		if (!client.user || !client.application || !process.env.CLIENT_ID) return;

		console.info(`${client.user.username} is online; v.${VERSION}`);
		const serializedCommands = commandsList.map((command) => command.data.toJSON());

		// Register commands for all guilds concurrently
		const guilds = Array.from(client.guilds.cache.values());
		if (guilds.length === 0) {
			console.info("Aucune guilde détectée, rien à enregistrer.");
			return;
		}

		console.info(`Enregistrement des commandes sur ${guilds.length} guildes...`);

		const guildPromises = guilds.map(async (guild) => {
			try {
				console.info(`[${guild.name}] Synchronisation des commandes...`);
				await guild.commands.set(serializedCommands);
				console.info(`[${guild.name}] OK (${serializedCommands.length} commandes).`);
				initAll(guild, client);
			} catch (error) {
				console.error(
					`[${guild.name}] Échec lors de l'enregistrement des commandes:`,
					error
				);
			}
		});

		// Exécuter toutes les promesses en parallèle
		await Promise.all(guildPromises);
		console.info("Toutes les guildes ont été traitées.");
		//create a cron job that runs every minute to check all guilds
		new CronJob(
			"*/1 * * * *",
			async () => {
				for (const guild of client.guilds.cache.values()) {
					console.log(`[${guild.name}] Running ensureBufferForGuild...`);
					try {
						await ensureBufferForGuild(client, guild.id);
						console.log(`[${guild.name}] ensureBufferForGuild executed successfully.`);
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
