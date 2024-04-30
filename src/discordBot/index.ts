import { participants, matches, Prisma } from "@prisma/client";
import { checkForuserDiscord, createUser, getLast20MatchesbyUuid, getQueue } from "../db";
import { getUUIDBasedOnGameName, stroreMatchData } from "../utils/lol_api";
import { UserLink, participantsWithmatchAndQueue } from "../interfaces/InterfaceAndTypes";
import { AvgDamageDealtTochampions, AvgGoldEarned, AvgMinionsKilled, CalSurrRates, CalVisionRates, CalWinRates } from "../utils/lolStats";
import fs from 'node:fs';
import path from 'node:path';
const { Client, GatewayIntentBits, EmbedBuilder, Routes, REST, Collection, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const rest = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN)
const commands: any[] = [];
export async function StartBot() {

    client.login(process.env.CLIENT_TOKEN);

    client.commands = new Collection();

    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {

        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);


            if ('data' in command && 'execute' in command) {
                console.log(`setting ${command.data.name}`)
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }


    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
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
                GetStats(msgData, message)
                break;
            case "leaderboard":
                HelpCommand(msgData)
                break;
            case "update":
                UpdateMatches(msgData)
                break;
        }
    }
});

client.on(Events.InteractionCreate, async (interaction: any) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
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
async function GetStats(msgData: any, message: string) {
    msgData.channel.send({ content: "Just a sec" });
    let type = message.slice(prefix.length).split(' ')[1]
    const userInfo = await checkForuserDiscord(msgData.author.id);

    if (!userInfo) {
        console.log("User not found");
        return
    }
    let queueId = "400";
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
            type = "normal"
            queueId = "400";
            break;
    }
    console.log(type, queueId)
    const matches = await getLast20MatchesbyUuid(userInfo, queueId);
    console.log(matches?.length)
    if (!matches?.length) {
        console.log('no parts found')
        return msgData.channel.send({ content: `No Games Found` });
    }
    let winRate = await CalWinRates(matches);
    let visionAvg = await CalVisionRates(matches);
    let champDamage = await AvgDamageDealtTochampions(matches);
    let surrRate = await CalSurrRates(matches);
    let avgMinionsKilled = await AvgMinionsKilled(matches);
    let avgGoldEarned = await AvgGoldEarned(matches);
    console.log("win rate: ", winRate);
    return msgData.channel.send({ content: `${type} \nwin rate:  ${winRate}\nVision Avg: ${visionAvg}\nAvg Damage Dealt to Champs: ${champDamage}\nSurrenders: ${surrRate}\nAvg Minions Killed: ${avgMinionsKilled}\nAvg Gold Earned: ${avgGoldEarned}\nin ${matches?.length} games` });
}

async function UpdateMatches(msgData: any) {
    msgData.channel.send({ content: "Just a sec" });
    let discord_user_id = msgData.author.id

    const user = await checkForuserDiscord(discord_user_id)

    if (!user || !user.uuid) {

        console.log("User Not Found")
        return
    }

    let stored = await stroreMatchData(user.uuid)
    if (stored) {
        return msgData.channel.send({ content: "User Data Updated" });
    }
    return msgData.channel.send({ content: "An Error Occured" });
}

