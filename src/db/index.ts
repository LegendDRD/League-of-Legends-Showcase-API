import mysql from 'mysql';
import md5 from 'md5';
import bcrypt from 'bcrypt';
import { PrismaClient, users } from '@prisma/client'
const prisma = new PrismaClient()


export async function createUser(user: UserLink) {
    let discordDBData = await checkForDiscord(user);

    if (!discordDBData) {
        console.log('createDiscord')
        discordDBData = await createDiscord(user)
    }
    let userDBData: any = await checkForuser(user)

    if (!userDBData) {
        console.log('createUser')
        userDBData = await createUserDB(user)
    }

    let userToDiscordLink: any = await checkForLink(userDBData, discordDBData)

    if (!userToDiscordLink) {
        console.log('CreatingLink')
        await linkUserDiscord(userDBData, discordDBData)
        console.log('User Linked to a Discord')
        return
    }
    console.log('User Already Linked')

}

export async function createDiscord(user: UserLink) {

    const newDiscord = await prisma.discords.create({
        data: {
            discord_id: user.discord_id
        }
    });
    return newDiscord

}

export async function createUserDB(user: UserLink) {

    const UserData = await prisma.users.create({
        data: {
            game_name: user.game_name,
            tag_line: user.tag_line,
            discord_user_id: user.discord_user_id,
            uuid: user.uuid || null
        }
    });
    return UserData

}

export async function linkUserDiscord(userDBData: any, discordDBData: any) {
    // console.log(newUser, discordDBData);
    // return
    const userLinked = await prisma.users_discords.create({
        data: {
            user_id: userDBData.id,
            discord_id: discordDBData.id
        }
    });
}

export async function checkForDiscord(user: UserLink) {
    const found = await prisma.discords.findFirst({ where: { discord_id: user.discord_id } });

    if (found !== null) {
        return found;
    } else {
        return false;
    }

}

export async function checkForuser(user: UserLink) {
    const found = await prisma.users.findFirst({
        where: {
            game_name: user.game_name,
            tag_line: user.tag_line
        }
    });

    if (found !== null) {
        return found;
    } else {
        return false;
    }

}

export async function checkForLink(userDBData: any, discordDBData: any) {
    const found = await prisma.users_discords.findFirst({
        where: {
            user_id: userDBData.id,
            discord_id: discordDBData.id
        }
    });

    if (found !== null) {
        return found;
    } else {
        return false;
    }

}

