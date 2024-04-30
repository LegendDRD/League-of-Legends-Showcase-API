import { users } from "@prisma/client";
import { checkForDiscord, checkForuserDiscord, getLast20MatchesbyUuid, getMatchesFromMili, getUsersFromDiscordId } from "../../../db";
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
    console.log(interaction.guild.id)
    let discord_id = interaction.guild.id;

    // Fetch user info from the database
    const discordInfo = await checkForDiscord(discord_id);

    if (!discordInfo) {
        console.log("Discord not found");
        await interaction.followUp({ content: "Discord not found." });
        return;
    }

    const discordUsers = await getUsersFromDiscordId(discordInfo.id)
    console.log(discordUsers);
    let startDate = getStartOfCurrentMonth();

    const Leaderboard = []

    for (let i = 0; i < discordUsers.length; i++) {
        let matchesThisMonth = await getMatchesFromMili(startDate, discordUsers[i].user);

        //TODO Calculate Score for each match and then produce a score for the month so far
        let MonthScore = 0;
        for (let j = 0; j < matchesThisMonth.length; j++) {
            MonthScore++

        }

        Leaderboard.push({
            user: discordUsers[i].user?.game_name,
            score: MonthScore
        })
        console.log(Leaderboard)
    }


    return interaction.channel.send({
        content: `Sheeshh`
    });
}

function getStartOfCurrentMonth() {
    // Get the current date
    const currentDate = new Date();

    // Set the date to the first day of the month
    currentDate.setDate(1);

    // Set the time to midnight (start of the day)
    currentDate.setHours(0, 0, 0, 0);

    // Get the milliseconds of the start of the month
    const startOfMonthMilliseconds = currentDate.getTime();
    // console.log("Milliseconds of the start of the month:", startOfMonthMilliseconds);
    return startOfMonthMilliseconds

}
