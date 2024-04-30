import { checkForuserDiscord, getLast20MatchesbyUuid, createUser } from "../../../db";
import { getUUIDBasedOnGameName } from "../../../utils/lol_api";

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('link your Discord account with your League of Legends account')
        .addStringOption((option: any) =>
            option.setName('username')
                .setDescription('Your League of Legends username and tag')
                .setRequired(true)),
    async execute(interaction: any) {
        await interaction.deferReply({ ephemeral: true }); // Defer the reply to avoid timeout

        try {
            const username = interaction.options.getString('username');
            // Call LinkMeCommand passing interaction and username as arguments
            await LinkMeCommand(interaction, username);
        } catch (error) {
            console.error('Error linking accounts:', error);
            await interaction.followUp({ content: 'An error occurred while linking accounts.' });
        }
    },
};

async function LinkMeCommand(interaction: any, username: string) {
    // Split username into game name and tag
    const [game_name, tag_line] = username.split('#');

    if (!game_name || !tag_line) {
        console.log("Invalid League Name");
        await interaction.followUp({ content: "Invalid League Name. Please provide your username and tag separated by '#'." });
        return;
    }

    const userLink: any = {
        game_name: game_name,
        tag_line: tag_line,
        discord_user_id: interaction.user.id
    };

    // Get UUID based on game name
    const riotResults: any = await getUUIDBasedOnGameName(userLink);

    if (!riotResults || !riotResults.puuid) {
        console.log("User Not Found");
        await interaction.followUp({ content: "User not found. Please check your League of Legends username and tag." });
        return;
    }

    userLink.uuid = riotResults.puuid;

    // Create user in the database
    await createUser(userLink);

    await interaction.followUp({ content: "Your Discord account has been linked with your League of Legends account." });
}