import * as Djs from "discord.js";

export const ping = {
	data: new Djs.SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with Pong!"),
	async execute(interaction: Djs.ChatInputCommandInteraction): Promise<void> {
		await interaction.reply("Pong!");
	},
};
