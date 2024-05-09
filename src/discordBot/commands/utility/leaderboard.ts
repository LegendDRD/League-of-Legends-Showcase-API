import { Message } from "discord.js";
import { checkForDiscord, checkForDiscordById, getMatchesFromMili, getUsersFromDiscordId } from "../../../db";
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const weights = {
    kills: .2,
    deaths: .2,
    assists: .2,
    firstBlood: .1,
    win: .2,
    vision_score: .01,
    dragon_kills: .09


}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show leaderboard for this Discord'),
    async execute(interaction: any) {
        await interaction.deferReply({ ephemeral: true }); // Defer the reply to avoid timeout

        try {
            // Call GetStats passing interaction and message as arguments
            await GetStats(interaction);

        } catch (error) {
            console.error('Error getting stats:', error);
            await interaction.followUp({ content: 'An error occurred while fetching stats.' });
        }
    },
};

async function GetStats(interaction: any) {
    const discord_id = interaction.guild.id;
    console.log(discord_id)
    // Fetch user info from the database
    const discordInfo = await checkForDiscordById(discord_id);
    console.log(discordInfo)

    if (!discordInfo) {
        console.log("Discord not found");
        await interaction.followUp({ content: "Discord not found." });
        return;
    }

    const discordUsers = await getUsersFromDiscordId(discordInfo.id)
    const startDate = getStartOfCurrentMonth();

    const Leaderboard = []

    for (let i = 0; i < discordUsers.length; i++) {
        const matchesThisMonth = await getMatchesFromMili(startDate, discordUsers[i].user);

        // TODO Calculate Score for each match and then produce a score for the month so far
        let MonthScore = 0;
        for (let j = 0; j < matchesThisMonth.length; j++) {

            let totalScorePerMatch = (matchesThisMonth[j].kills * weights.kills) +
                (matchesThisMonth[j].deaths * -weights.deaths) +
                (matchesThisMonth[j].assists * weights.assists) +
                (matchesThisMonth[j].first_blood_kill ? 1 : 0 * weights.firstBlood) +
                (matchesThisMonth[j].win ? 2 : 0 * -weights.win) +
                (matchesThisMonth[j].vision_score * weights.vision_score) +
                (matchesThisMonth[j].dragon_kills * weights.dragon_kills)

            if (!matchesThisMonth[j].win && matchesThisMonth[j].game_ended_in_surrender) {
                totalScorePerMatch = totalScorePerMatch * .5
            }

            MonthScore += (totalScorePerMatch / matchesThisMonth.length) * 100
        }



        Leaderboard.push({
            user: discordUsers[i].user?.game_name,
            score: MonthScore,
            hasntPlayed: matchesThisMonth.length < 1
        })



        console.log(Leaderboard)
    }
    const sortedLB = Leaderboard.sort((a, b) => {
        return b.score - a.score;
    });

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Leaderboard')
        .setTimestamp();

    for (let i = 0; i < sortedLB.length; i++) {

        embed.addFields({ name: `${i + 1}${i + 1 < 4 ? i + 1 === 1 ? "st" : i + 1 === 2 ? "nd" : "rd" : "th"}`, value: `${Leaderboard[i].user} -  ${Leaderboard[i].hasntPlayed ? "No Games Played This Month" : `Score: ${Math.floor(Leaderboard[i].score)}`} ` })
    }

    // Send the embed message to the desired channel
    // Assuming 'message' is the message object and 'channel' is the channel you want to send the embed to

    interaction.followUp({ content: "Here you go, This is the current Leaderboard stats." });
    return interaction.channel.send({
        embeds: [embed]
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
