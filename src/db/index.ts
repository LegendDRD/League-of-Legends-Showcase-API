import mysql from 'mysql';
import md5 from 'md5';
import bcrypt from 'bcrypt';
import { PrismaClient, users, participants, matches } from '@prisma/client'
import { match } from 'assert';
import { UserLink } from '../interfaces/InterfaceAndTypes';
import { User } from 'discord.js';
import { time } from 'console';
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

    const userToDiscordLink: any = await checkForLink(userDBData, discordDBData)

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
export async function checkForDiscordById(discord_id: any) {
    const found = await prisma.discords.findFirst({ where: { discord_id } });

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

export async function checkForuserDiscord(discordUserId: string) {
    const found = await prisma.users.findFirst({
        where: {
            discord_user_id: discordUserId
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

export async function storeMatchDataToDB(data: Omit<matches, 'id'>) {
    const matchData = await prisma.matches.create({
        data
    });

    if (matchData !== null) {
        return matchData;
    } else {
        return false;
    }
}

export async function storeParticipantDataToDB(data: Omit<participants, 'id'>) {
    const matchData = await prisma.participants.create({
        data
    });

    if (matchData !== null) {
        return matchData;
    } else {
        return false;
    }
}

export async function checkForMatch(matchId: string) {
    const found = await prisma.matches.findFirst({
        where: {
            match_id: matchId
        }
    });

    if (found !== null) {
        return found;
    } else {
        return false;
    }

}

export async function getLast20MatchesbyUuid(user: users, queueId: string) {

    if (user.uuid === null) {
        console.log('No uuid found')
        return
    }
    //
    const results = await prisma.participants.findMany({
        where: {
            uuid: user.uuid,
            match: { queue_id: (queueId === '400' ? queueId || "430" : queueId) }
        },
        include: {
            match: {
                include: {
                    queue: true
                }
            }
        },
        orderBy: {
            match: {
                game_start_timestamp: 'desc',

            }
        },
        take: 20
    })

    return results
}

export async function getAllLast20MatchesbyUuid(user: users) {

    if (user.uuid === null) {
        console.log('No uuid found')
        return
    }
    // console.log(user)
    const results = await prisma.participants.findMany({
        where: {
            uuid: user.uuid
        },
        include: {
            match: {
                include: {
                    queue: true
                }
            }
        },
        orderBy: {
            match: {
                game_start_timestamp: 'desc',


            }
        },
        take: 20
    })

    return results
}

export async function getUsersFromDiscordId(id: number) {
    const results = await prisma.users_discords.findMany({
        where: {
            discord_id: id
        },
        include: {
            user: true
        }
    })

    // console.log("discord Users", results)

    return results

}

export async function getMatchesFromMili(timeStamp: number, user: any) {
    // console.log('timeStamp', timeStamp, user.uuid)
    const found = await prisma.participants.findMany({
        include: {
            match: true
        },
        where: {
            uuid: user.uuid,
            match: {
                game_start_timestamp: {
                    gte: timeStamp
                },
                queue_id: { in: ["420", "440"] }
            }
        }
    });

    return found

}

export async function deleteOldMatchesAndParticipants() {
    // Calculate the date that was 2 months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const twoMonthsAgoTimestamp = twoMonthsAgo.getTime();
    // Find and delete matches older than two months
    const oldMatches = await prisma.matches.findMany({
        where: {

            game_start_timestamp: { lt: twoMonthsAgoTimestamp }

        }
    });
    // console.log(oldMatches)
    for (let i = 0; i < oldMatches.length; i++) {
        await prisma.participants.deleteMany({
            where: { match_id: oldMatches[i].match_id }
        })
    }

    await prisma.matches.deleteMany({
        where: {

            game_start_timestamp: { lt: twoMonthsAgoTimestamp }

        }
    });

    console.log(`Deleted ${oldMatches.length} matches older than 2 months.`);

}