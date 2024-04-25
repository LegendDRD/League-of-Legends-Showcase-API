import { participants } from "@prisma/client";
import { checkForuserDiscord, createUser, getLast100MatchesbyUuid } from "../db";
import { getUUIDBasedOnGameName, stroreMatchData } from "../utils/lol_api";

const { Client, GatewayIntentBits, EmbedBuilder, Routes, REST } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const commands = [
    {
        name: "help",
        description: "Shows list of commands"
    }];


const rest = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN)

export async function StartBot() {

    client.login(process.env.CLIENT_TOKEN);
}

const listOfGuildsReg: any = []
let prefix = "!"

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (msgData: any) => {

    let message = msgData.content
    console.log(message)
    //TODO Finsih off Registration of slash commands
    // RegCommandsOnServer(msgData)

    if (message.substring(0, 1) === prefix) {
        const command = message.slice(prefix.length).split(' ')[0]

        switch (command) {
            case "help":
                HelpCommand(msgData)
                break;
            case "linkme":
                LinkMeCommand(msgData, message)
                break;
            case "stats":
                GetStates(msgData)
                break;
            case "leaderboard":
                HelpCommand(msgData)
                break;
            case "Update":
                UpdateMatches(msgData, message)
                break;
        }
    }
});

async function HelpCommand(msgData: any) {
    console.log(msgData)

    const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)

        .setTitle('Helpful Commands')
        .setAuthor({ name: 'LOL Leaderboard Bot' })
        .setDescription('Commands List')
        .addFields(
            { name: '!help', value: 'Shows a list of Commands' },
            { name: '!linkme', value: 'Links Account to the leaderboard' },
            { name: '!stats', value: 'Retrive Players stats' },
            { name: '!leaderboard', value: 'Shows Discords lol LeaderBoard and Everyone Linked' }
        )

    msgData.channel.send({ content: "This is a help command", embeds: [exampleEmbed] });
}

async function LinkMeCommand(msgData: any, message: string) {

    const userNameAndTag = message.slice(prefix.length).split(' ')[1]

    if (!userNameAndTag.includes('#')) {
        console.log("Invalid League Name")
        return
    }

    const userLink: UserLink = {
        game_name: userNameAndTag.split('#')[0],
        tag_line: userNameAndTag.split('#')[1],
        discord_id: msgData.guildId,
        discord_user_id: msgData.author.id

    }

    // if (typeof userLink.gameName === 'undefined') {
    //     return res.send({ statusCode: 5, message: "GameName Undefined" })
    // }
    // if (typeof userLink.tagLine === 'undefined') {
    //     return res.send({ statusCode: 5, message: "TagLine Undefined" })
    // }
    // if (typeof userLink.discordId === 'undefined') {
    //     return res.send({ statusCode: 5, message: "discordId Undefined" })
    // }


    const riotResults: any = await getUUIDBasedOnGameName(userLink)

    if (!riotResults) {
        //TODO send user saying user not found or soemthing went wrong
        console.log("User Not Found")
        return
    }

    userLink.uuid = riotResults.puuid
    await createUser(userLink);

    // }
}
async function GetStates(msgData: any) {

    const userInfo = await checkForuserDiscord(msgData.author.id);

    if (!userInfo) {
        console.log("User not found");
        return
    }
    const matches = await getLast100MatchesbyUuid(userInfo);
    console.log("Matches: ", matches);
    if (!matches?.length) {
        console.log('no parts found')
        return
    }
    let winRate = await CalWinRates(matches);
    console.log("win rate: ", winRate);
}

async function UpdateMatches(msgData: any, message: string) {
    msgData.channel.send({ content: "Just a sec" });
    let discord_user_id = msgData.author.id

    const user = await checkForuserDiscord(discord_user_id)

    if (!user || !user.uuid) {

        console.log("User Not Found")
        return
    }

    await stroreMatchData(user.uuid)
    return msgData.channel.send({ content: "User Data Updated" });
}

async function RegCommandsOnServer(msg: any) {
    // if (listOfGuildsReg.find((id: number) => { msg.guildId !== id })) {
    try {
        console.log('Registering commands');

        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_TOKEN, msg.guildId), { body: commands })

        console.log('commands Reg Succ');
    } catch (error) {
        console.log(error);
    }
    listOfGuildsReg.push(msg.guildId)
    // }
}

async function CalWinRates(matches: any) {
    console.log(matches[0])

    let wins = 0;
    let overAllWinRate = 0

    let flexRankedMatchesWins = 0
    let flexRankedMatchesCount = 0
    let flexWinRate = 0;

    let soloRankedMatchesWins = 0
    let soloRankedMatchesCount = 0
    let soloWinRate = 0;

    let normalMatchesWins = 0
    let normalMatchesCount = 0
    let normalWinRate = 0;

    let aramMatchesWins = 0
    let aramMatchesCount = 0
    let aramWinRate = 0;


    for (let i = 0; i < matches.length; i++) {

        if (matches[i].win) {
            wins++;
        }

        if (matches[i].match.queue.queue_id === '440') {
            flexRankedMatchesCount++;
            if (matches[i].win) {
                flexRankedMatchesWins++;
            }
        }
        if (matches[i].match.queue.queue_id === '420') {
            soloRankedMatchesCount++;
            if (matches[i].win) {
                soloRankedMatchesWins++;
            }
        }
        if (matches[i].match.queue.queue_id === '430' || matches[i].match.queue.queue_id === '400') {
            normalMatchesCount++;
            if (matches[i].win) {
                normalMatchesWins++;
            }
        }
        if (matches[i].match.queue.queue_id === '450') {
            aramMatchesCount++;
            if (matches[i].win) {
                aramMatchesWins++;
            }
        }


    }
    flexWinRate = (flexRankedMatchesWins / flexRankedMatchesCount) * 100
    soloWinRate = (soloRankedMatchesWins / soloRankedMatchesCount) * 100
    normalWinRate = (normalMatchesWins / normalMatchesCount) * 100
    aramWinRate = (aramMatchesWins / aramMatchesCount) * 100
    overAllWinRate = (wins / matches.length) * 100

    return { flexWinRate, soloWinRate, normalWinRate, aramWinRate, overAllWinRate }
}