import process from "node:process";
import type { Client } from "discord.js";
import dotenv from "dotenv";
import { VERSION } from "..";
import { commandsList } from "../commands";

dotenv.config({ path: ".env" });

export default (client: Client): void => {
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
				// L'appel REST écrase l'ensemble des commandes guild pour cette application.
				await guild.commands.set(serializedCommands);
				console.info(`[${guild.name}] OK (${serializedCommands.length} commandes).`);
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
	});
};
