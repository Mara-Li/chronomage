import { CountJobs, DateJobs } from "@/interface";
import type { EClient } from "@/client";
export default (client: EClient): void => {
	client.on("guildDelete", async (guild) => {
		client.settings.delete(guild.id);
		//stop and delete any existing CountJob
		if (CountJobs.has(guild.id)) {
			const existingCountJob = CountJobs.get(guild.id);
			existingCountJob?.stop();
			CountJobs.delete(guild.id);
		}
		//stop and delete any existing DateJob
		if (DateJobs.has(guild.id)) {
			const existingDateJob = DateJobs.get(guild.id);
			existingDateJob?.stop();
			DateJobs.delete(guild.id);
		}
		console.info(`Guild ${guild.name} has been removed from the database.`);
	});
};
