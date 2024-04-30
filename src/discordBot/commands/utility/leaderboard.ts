import { checkForuserDiscord, getLast20MatchesbyUuid } from "../../../db";
import { CalWinRates, CalVisionRates, AvgDamageDealtTochampions, CalSurrRates, AvgMinionsKilled, AvgGoldEarned, AvgDurationOfGame, AvgDeathsGame, AvgKillsGame, TotaPentas, TotaQuadrs, TripleKills } from "../../../utils/lolStats";
import { stroreMatchData } from "../../../utils/lol_api";

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show leaderboard for this Discord'),
    async execute(interaction: any) {
        await interaction.deferReply({ ephemeral: true }); // Defer the reply to avoid timeout

        try {
            // Call GetStats passing interaction and message as arguments
            await GetStats(interaction);
            await interaction.followUp({ content: 'The Current Leaderboard:' });
        } catch (error) {
            console.error('Error getting stats:', error);
            await interaction.followUp({ content: 'An error occurred while fetching stats.' });
        }
    },
};

async function GetStats(interaction: any) {
    // Extract user ID from interaction
    let discord_user_id = interaction.user.id;

    // Fetch user info from the database
    const userInfo = await checkForuserDiscord(discord_user_id);

    if (!userInfo) {
        console.log("User not found");
        await interaction.followUp({ content: "User not found." });
        return;
    }

    return interaction.channel.send({
        content: `Sheeshh`
    });
}
