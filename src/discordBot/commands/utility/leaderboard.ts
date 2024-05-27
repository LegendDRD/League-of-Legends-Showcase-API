import { Colors, Message } from "discord.js";
import { checkForDiscord, checkForDiscordById, checkForuserDiscord, deleteOldMatchesAndParticipants, getMatchesFromMili, getUsersFromDiscordId } from "../../../db";
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { storeMatchData } from "../../../utils/lol_api";

const weights = {
    kills: .2,
    deaths: .2,
    assists: .2,
    firstBlood: .1,
    win: .2,
    vision_score: .01,
    dragon_kills: .09


}
let previousLB: any = [];
// let previousLB: any = [
//     { user: 'Sancteezy', score: 408, hasntPlayed: false },
//     { user: 'Xnobiso', score: 378.0333333333333, hasntPlayed: false },
//     { user: 'Hasaki', score: 369.35, hasntPlayed: false },
//     { user: 'Saros', score: 3050000.625, hasntPlayed: false },
//     {
//         user: 'SpottedSnowman',
//         score: 281.62676056338023,
//         hasntPlayed: false
//     },
//     {
//         user: 'Known HighRoller',
//         score: 264.87037037037044,
//         hasntPlayed: false
//     },
//     { user: 'notSaros', score: 100.3783783783784, hasntPlayed: false },
//     {
//         user: 'DarkAlphaWolf20',
//         score: 219.96153846153845,
//         hasntPlayed: false
//     },
//     { user: 'Khenai', score: 0, hasntPlayed: true },
//     { user: 'RetroWarrior', score: 0, hasntPlayed: true },

// ];
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Show leaderboard for this Discord'),
    async execute(interaction: any) {
        await interaction.deferReply({ ephemeral: true }); // Defer the reply to avoid timeout

        try {

            const discordId = interaction.guild.id

            const discordInfo = await checkForDiscordById(discordId);

            if (!discordInfo) {
                console.log("Discord not found");
                await interaction.followUp({ content: "Discord not found." });
                return;
            }

            const discordUsers = await getUsersFromDiscordId(discordInfo.id)
            interaction.followUp({ content: "Updating Users Matches... (Can take some time)" });
            interaction.channel.send({
                content: `${interaction.user.username} is generating a leaderboard... `,

            });

            for (let i = 0; i < discordUsers.length; i++) {

                const discordUser: any = discordUsers[i].user?.discord_user_id;
                if (discordUser) {

                    const user = await checkForuserDiscord(discordUser);

                    if (user && user.uuid) {
                        // Store match data
                        // console.log(user.game_name)

                        await storeMatchData(user.uuid);
                    }
                }

            }

            deleteOldMatchesAndParticipants();

            await GetStatsV2(interaction);

        } catch (error) {
            console.error('Error getting stats:', error);
            await interaction.followUp({ content: 'An error occurred while fetching stats.' });
        }
    },
};

async function GetStats(interaction: any) {
    const discord_id = interaction.guild.id;
    // console.log(discord_id)
    // Fetch user info from the database
    const discordInfo = await checkForDiscordById(discord_id);
    // console.log(discordInfo)

    if (!discordInfo) {
        console.log("Discord not found");
        await interaction.followUp({ content: "Discord not found." });
        return;
    }

    const discordUsers = await getUsersFromDiscordId(discordInfo.id)
    const startDate = getStartOfCurrentMonth();

    const Leaderboard: any = []

    for (let i = 0; i < discordUsers.length; i++) {
        const matchesThisMonth = await getMatchesFromMili(startDate, discordUsers[i].user);

        // TODO Calculate Score for each match and then produce a score for the month so far

        let MonthScore = 0;
        let wins = 0
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
            if (matchesThisMonth.length < 10) {

                MonthScore += (totalScorePerMatch / 10) * 100
            } else {

                MonthScore += (totalScorePerMatch / matchesThisMonth.length) * 100
            }
            if (matchesThisMonth[j].win) {
                wins++
            }
        }
        const winRate = wins / matchesThisMonth.length


        Leaderboard.push({
            user: discordUsers[i].user?.game_name,
            score: MonthScore,
            hasntPlayed: matchesThisMonth.length < 1,
            gamesPlayed: matchesThisMonth.length,
            winRate
        })



        // console.log(Leaderboard)
    }
    const sortedLB = Leaderboard.sort((a: any, b: any) => {
        return b.score - a.score;
    });

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Leaderboard')
        .setTimestamp();

    for (let i = 0; i < sortedLB.length; i++) {
        let pos: any = 999;
        let oldUserData;
        for (let j = 0; j < sortedLB.length; j++) {
            pos = previousLB.findIndex((item: any) => item.user === Leaderboard[i].user);
            oldUserData = previousLB.find((item: any) => item.user === Leaderboard[i].user);
        }
        let posText = ""
        if (previousLB.length > 0) {
            console.log(pos, i)
            if (i > pos) {
                posText = "▼"
            } else if (i < pos) {
                posText = "▲"
            }
        }
        let scoreDiff = 0
        let scoreDiffTEXT = ""
        if (oldUserData && previousLB.length > 0) {
            scoreDiff = Leaderboard[i].score - oldUserData.score
            if (scoreDiff > 0) {
                scoreDiffTEXT = `(+${scoreDiff.toFixed(1)})`
            } else if (scoreDiff === 0) {
                scoreDiffTEXT = ``
            } else {
                scoreDiffTEXT = `(${scoreDiff.toFixed(1)})`
            }
        }
        embed.addFields({
            name: `${i + 1}${i + 1 < 4 ? i + 1 === 1 ? "st" : i + 1 === 2 ? "nd" : "rd" : "th"}`,
            value: `${posText} ${Leaderboard[i].user} | ${Leaderboard[i].gamesPlayed > 9 ? `${Leaderboard[i].hasntPlayed ? "No Games Played This Month" : `Score: ${Math.floor(Leaderboard[i].score)} ${scoreDiffTEXT}`}` : `In Placements ${Leaderboard[i].gamesPlayed}/10`} | NO. Games: ${Leaderboard[i].gamesPlayed} | ${Leaderboard[i].winRate.toFixed(2) * 100}% `
        })
    }

    // Send the embed message to the desired channel
    // Assuming 'message' is the message object and 'channel' is the channel you want to send the embed to

    interaction.followUp({ content: "leaderboard Generated!!" });
    previousLB = Leaderboard
    console.log(previousLB)
    return interaction.channel.send({
        content: "Here you go, This is the current Leaderboard stats " + interaction.user.username,
        embeds: [embed]
    });
}

async function GetStatsV2(interaction: any) {
    // TODO Rework needed
    const discord_id = interaction.guild.id;
    // console.log(discord_id)
    // Fetch user info from the database
    const discordInfo = await checkForDiscordById(discord_id);
    // console.log(discordInfo)

    if (!discordInfo) {
        console.log("Discord not found");
        await interaction.followUp({ content: "Discord not found." });
        return;
    }

    const discordUsers = await getUsersFromDiscordId(discordInfo.id)
    const startDate = getStartOfCurrentMonth();

    const Leaderboard: any = [];
    for (let i = 0; i < discordUsers.length; i++) {
        const matchesThisMonth = await getMatchesFromMili(startDate, discordUsers[i].user);

        // TODO Calculate Score for each match and then produce a score for the month so far

        let MonthScore = 0;
        let wins = 0
        for (let j = 0; j < matchesThisMonth.length; j++) {
            let kills = 0;
            let deaths = 0
            let assists = 0;
            let firstBlood = 0;
            let VisionScore = 0;

            if (matchesThisMonth[j].kills > 0) {
                kills = (matchesThisMonth[j].kills)
            }
            if (matchesThisMonth[j].deaths > 0) {
                deaths = matchesThisMonth[j].deaths
            }
            if (matchesThisMonth[j].assists > 0) {
                assists = (matchesThisMonth[j].assists / 2)
            }
            if (matchesThisMonth[j].first_blood_kill) {
                firstBlood = 2
            }
            if (matchesThisMonth[j].vision_score > 0) {
                VisionScore = matchesThisMonth[j].vision_score / 10
            }

            let totalScorePerMatch = kills + deaths + assists + firstBlood + VisionScore;

            // FF
            if (!matchesThisMonth[j].win && matchesThisMonth[j].game_ended_in_surrender) {
                if (totalScorePerMatch > 0) {

                    totalScorePerMatch = totalScorePerMatch * .5
                } else {
                    totalScorePerMatch = totalScorePerMatch * 1.5
                }
            }

            let preWinRate = 0
            if (j === 0) {
                preWinRate = matchesThisMonth[j].win ? 1 : 0
            } else {
                if (wins === 0) {
                    preWinRate = 0
                } else {

                    preWinRate = wins / j
                }
            }

            if (matchesThisMonth[j].win) {
                if (totalScorePerMatch < 0) {
                    totalScorePerMatch = totalScorePerMatch * -.5
                    totalScorePerMatch = totalScorePerMatch * preWinRate
                } else {
                    totalScorePerMatch = totalScorePerMatch * preWinRate
                }

            } else {
                totalScorePerMatch = totalScorePerMatch * -.2
            }
            // if (discordUsers[i].user?.uuid === "ofSnHkQl_CN2mRAUucVsml1biPuMWZ_Orn52qY3ixfwcCaAe5_HSF5ZNJ4iFa-C1X2OCUuhSnKkAag") {

            //     console.log("preWinRate", preWinRate, "totalScorePerMatch", totalScorePerMatch)
            // }

            MonthScore += totalScorePerMatch
            // if (matchesThisMonth.length < 5) {

            //     MonthScore += (totalScorePerMatch / 5)
            // } else {

            //     MonthScore += (totalScorePerMatch / matchesThisMonth.length)
            // }

            if (matchesThisMonth[j].win) {
                wins++
            }

        }
        const winRate = wins / matchesThisMonth.length


        Leaderboard.push({
            user: discordUsers[i].user?.game_name,
            score: MonthScore,
            hasntPlayed: matchesThisMonth.length < 1,
            gamesPlayed: matchesThisMonth.length,
            winRate
        })

        // console.log(Leaderboard)
    }

    const sortedLB = Leaderboard.sort((a: any, b: any) => {
        return b.score - a.score;
    });

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Leaderboard')
        .setTimestamp();

    for (let i = 0; i < sortedLB.length; i++) {
        let pos: any = 999;
        let oldUserData;
        for (let j = 0; j < sortedLB.length; j++) {
            pos = previousLB.findIndex((item: any) => item.user === Leaderboard[i].user);
            oldUserData = previousLB.find((item: any) => item.user === Leaderboard[i].user);
        }
        let posText = ""
        if (previousLB.length > 0) {
            console.log(pos, i)
            if (i > pos) {
                posText = "▼"
            } else if (i < pos) {
                posText = "▲"
            }
        }
        let scoreDiff = 0
        let scoreDiffTEXT = ""
        if (oldUserData && previousLB.length > 0) {
            scoreDiff = Leaderboard[i].score - oldUserData.score
            if (scoreDiff > 0) {
                scoreDiffTEXT = `(+${scoreDiff.toFixed(1)})`
            } else if (scoreDiff === 0) {
                scoreDiffTEXT = ``
            } else {
                scoreDiffTEXT = `(${scoreDiff.toFixed(1)})`
            }
        }
        embed.addFields({
            name: `${i + 1}${i + 1 < 4 ? i + 1 === 1 ? "st" : i + 1 === 2 ? "nd" : "rd" : "th"}`,
            value: `${posText} ${Leaderboard[i].user} | ${Leaderboard[i].gamesPlayed > 9 ? `${Leaderboard[i].hasntPlayed ? "No Games Played This Month" : `Score: ${Math.floor(Leaderboard[i].score)} ${scoreDiffTEXT}`}` : `In Placements ${Leaderboard[i].gamesPlayed}/10`} | NO. Games: ${Leaderboard[i].gamesPlayed} | ${Leaderboard[i].winRate.toFixed(2) * 100}% `
        })
    }

    // Send the embed message to the desired channel
    // Assuming 'message' is the message object and 'channel' is the channel you want to send the embed to

    interaction.followUp({ content: "leaderboard Generated!!" });
    previousLB = Leaderboard
    console.log(previousLB)
    return interaction.channel.send({
        content: "Here you go, This is the current Leaderboard stats " + interaction.user.username,
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
