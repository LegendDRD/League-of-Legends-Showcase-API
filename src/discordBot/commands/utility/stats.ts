import { checkForuserDiscord, getLast20MatchesbyUuid } from "../../../db";
import { CalWinRates, CalVisionRates, AvgDamageDealtTochampions, CalSurrRates, AvgMinionsKilled, AvgGoldEarned, AvgDurationOfGame, AvgDeathsGame, AvgKillsGame, TotaPentas, TotaQuadrs, TripleKills } from "../../../utils/lolStats";


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
            await interaction.followUp({ content: `Your Stats: ${message.user.username}` });
        } catch (error) {
            console.error('Error getting stats:', error);
            await interaction.followUp({ content: 'An error occurred while fetching stats.' });
        }
    },
};

async function GetStats(interaction: any, message: string) {
    // Extract user ID from interaction
    const discord_user_id = interaction.user.id;

    // Fetch user info from the database
    const userInfo = await checkForuserDiscord(discord_user_id);

    if (!userInfo) {
        console.log("User not found");
        await interaction.followUp({ content: "User not found." });
        return;
    }

    // Determine queue type based on message
    const type = message.toLowerCase();
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
            queueId = "normal";
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
    const winRate = await CalWinRates(matches);
    const visionAvg = await CalVisionRates(matches);
    const champDamage = await AvgDamageDealtTochampions(matches);
    const surrRate = await CalSurrRates(matches);
    const avgMinionsKilled = await AvgMinionsKilled(matches);
    const avgGoldEarned = await AvgGoldEarned(matches);
    const avgDurationOfGame = await AvgDurationOfGame(matches);
    const avgKillsGame = await AvgKillsGame(matches);
    const avgDeathsGame = await AvgDeathsGame(matches);
    const totaPentas = await TotaPentas(matches);
    const totaQuadrs = await TotaQuadrs(matches);
    const tripleKills = await TripleKills(matches);


    console.log("win rate: ", winRate);
    return interaction.channel.send({
        content: `${type} - ${interaction.user.username}
    win rate:  ${winRate}
    Vision Avg: ${visionAvg.toFixed(2)}
    Avg Damage Dealt to Champs: ${champDamage.toFixed(2)}
    Surrenders: ${surrRate.toFixed(2)}
    Avg Minions Killed: ${avgMinionsKilled.toFixed(2)}
    Avg Gold Earned: ${avgGoldEarned.toFixed(2)}
    Avg Time Spent: ${(avgDurationOfGame / 60000).toFixed(2)}
    Avg Kills: ${avgKillsGame.toFixed(2)}
    Avg Deaths: ${avgDeathsGame.toFixed(2)}
    Total Pentas Kills: ${totaPentas}
    Total Quadra Kills: ${totaQuadrs}
    Total Triple Kills: ${tripleKills}
    in ${matches?.length} games`
    });
}
