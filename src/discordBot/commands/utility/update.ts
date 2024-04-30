import { checkForuserDiscord } from "../../../db";
import { stroreMatchData } from "../../../utils/lol_api";

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('updates user data'),
    async execute(interaction: any) {
        await interaction.deferReply({ ephemeral: true }); // Defer the reply to avoid timeout

        try {
            // Call UpdateMatches passing interaction as argument
            await UpdateMatches(interaction);
        } catch (error) {
            console.error('Error updating user data:', error);
            await interaction.followUp({ content: 'An error occurred while updating user data.' });
        }
    },
};

async function UpdateMatches(interaction: any) {
    // Get the user ID from the interaction
    let discord_user_id = interaction.user.id;

    // Check if user exists in the database
    const user = await checkForuserDiscord(discord_user_id);

    if (!user || !user.uuid) {
        console.log("User Not Found");
        await interaction.followUp({ content: "User not found." });
        return;
    }

    // Store match data
    let stored = await stroreMatchData(user.uuid);
    if (stored) {
        await interaction.followUp({ content: "User data updated successfully." });
    } else {
        await interaction.followUp({ content: "An error occurred while updating user data." });
    }
}