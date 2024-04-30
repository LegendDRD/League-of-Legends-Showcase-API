import { checkForuserDiscord, getLast20MatchesbyUuid } from "../../../db";
import { CalWinRates, CalVisionRates, AvgDamageDealtTochampions, CalSurrRates, AvgMinionsKilled, AvgGoldEarned, AvgDurationOfGame, AvgDeathsGame, AvgKillsGame, TotaPentas, TotaQuadrs, TripleKills } from "../../../utils/lolStats";
import { stroreMatchData } from "../../../utils/lol_api";

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('get stats for selected games')
        .addStringOption((option: any) =>
            option.setName('type')
                .setDescription('The type of match')
                .setRequired(true)
                .addChoices(
                    { name: 'Solo', value: "solo" },
                    { name: 'Flex', value: "flex" },
                    { name: 'Normal', value: "normal" },
                    { name: 'Aram', value: "aram" },
                )),
    async execute(interaction: any) {
        await interaction.deferReply({ ephemeral: true }); // Defer the reply to avoid timeout

        try {
            console.log(interaction.options._hoistedOptions)
            const message = interaction.options._hoistedOptions[0].value;
            // Call GetStats passing interaction and message as arguments
            await GetStats(interaction, message);
            await interaction.followUp({ content: 'Your Stats:' });
        } catch (error) {
            console.error('Error getting stats:', error);
            await interaction.followUp({ content: 'An error occurred while fetching stats.' });
        }
    },
};

async function GetStats(interaction: any, message: string) {
    // Extract user ID from interaction
    let discord_user_id = interaction.user.id;

    // Fetch user info from the database
    const userInfo = await checkForuserDiscord(discord_user_id);

    if (!userInfo) {
        console.log("User not found");
        await interaction.followUp({ content: "User not found." });
        return;
    }

    // Determine queue type based on message
    let type = message.toLowerCase();
    let queueId = "400"; // Default queue ID for normal games
    switch (type) {
        case "solo":
            queueId = "420";
            break;
        case "flex":
            queueId = "440";
            break;
        case "normal":
            queueId = "400";
            break;
        case "aram":
            queueId = "450";
            break;
        default:
            type = "normal";
            break;
    }

    // Fetch last 20 matches for the user and queue
    const matches = await getLast20MatchesbyUuid(userInfo, queueId);

    if (!matches?.length) {
        console.log('No games found');
        await interaction.followUp({ content: "No games found." });
        return;
    }

    // Calculate stats
    let winRate = await CalWinRates(matches);
    let visionAvg = await CalVisionRates(matches);
    let champDamage = await AvgDamageDealtTochampions(matches);
    let surrRate = await CalSurrRates(matches);
    let avgMinionsKilled = await AvgMinionsKilled(matches);
    let avgGoldEarned = await AvgGoldEarned(matches);
    let avgDurationOfGame = await AvgDurationOfGame(matches);
    let avgKillsGame = await AvgKillsGame(matches);
    let avgDeathsGame = await AvgDeathsGame(matches);
    let totaPentas = await TotaPentas(matches);
    let totaQuadrs = await TotaQuadrs(matches);
    let tripleKills = await TripleKills(matches);


    console.log("win rate: ", winRate);
    return interaction.channel.send({
        content: `${type} 
    win rate:  ${winRate}
    Vision Avg: ${visionAvg}
    Avg Damage Dealt to Champs: ${champDamage}
    Surrenders: ${surrRate}
    Avg Minions Killed: ${avgMinionsKilled}
    Avg Gold Earned: ${avgGoldEarned}
    Avg Time Spent: ${avgDurationOfGame / 60000}
    Avg Kills: ${avgKillsGame}
    Avg Deaths: ${avgDeathsGame}
    Total Pentas Kills: ${totaPentas}
    Total Quadra Kills: ${totaQuadrs}
    Total Triple Kills: ${tripleKills}
    in ${matches?.length} games`
    });
}
