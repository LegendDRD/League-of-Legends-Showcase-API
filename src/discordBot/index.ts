const { Client, GatewayIntentBits, EmbedBuilder, Message } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


export async function StartBot() {

    client.login(process.env.CLIENT_TOKEN);

}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', (msg: any) => {
    let prefix = "!"
    let message = msg.content

    if (message.substring(0, 1) === prefix) {
        const command = message.slice(prefix.length).split(' ')[0]

        switch (command) {
            case "help":
                helpCommand(msg)
                break;
            case "linkme":
                helpCommand(msg)
                break;
            case "stats":
                helpCommand(msg)
                break;
            case "leaderboard":
                helpCommand(msg)
                break;
        }
    }
});

async function helpCommand(msg) {
    // .channel.send("This is a help command");

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

    msg.channel.send({ content: "This is a help command", embeds: [exampleEmbed] });
}