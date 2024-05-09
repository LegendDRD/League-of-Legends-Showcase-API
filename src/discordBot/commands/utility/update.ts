import delay from "delay";
import { checkForDiscordById, checkForuserDiscord, deleteOldMatchesAndParticipants, getUsersFromDiscordId } from "../../../db";
import { storeMatchData } from "../../../utils/lol_api";

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

    const discordId = interaction.guild.id

    const discordInfo = await checkForDiscordById(discordId);

    if (!discordInfo) {
        console.log("Discord not found");
        await interaction.followUp({ content: "Discord not found." });
        return;
    }

    const discordUsers = await getUsersFromDiscordId(discordInfo.id)
    await interaction.followUp({ content: "Lol Matches Will Update Slowly." });

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
    await interaction.followUp({ content: "Lol Matches data updated successfully." });

}

