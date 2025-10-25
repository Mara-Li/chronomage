import type { EClient } from "client";
import { commandsList } from "commands";
import { defaultTemplate } from "utils";

export default (client: EClient): void => {
	client.on("guildCreate", async (guild) => {
		try {
			const commandPromises = commandsList.map((command) =>
				guild.commands.create(command.data)
			);
			await Promise.all(commandPromises);

			console.log(
				`All commands created in ${guild.name} (${commandsList.length} commands).`
			);
			//ensure default data is created for the guild
			client.settings.ensure(guild.id, {
				templates: defaultTemplate(),
				events: {},
				schedules: {},
				settings: {
					language: guild.preferredLocale,
					futurMinBlock: 2,
				},
			});
		} catch (error) {
			console.error(error);
		}
	});
};
