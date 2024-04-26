import { Prisma } from "@prisma/client";

export interface UserLink {
    game_name: string;
    tag_line: string;
    discord_id: string;
    discord_user_id: string;
    uuid?: string;
}


export type participantsWithmatchAndQueue = Prisma.participantsGetPayload<{
    include: {
        match: {
            include: {
                queue: true
            }
        }
    }
}>
