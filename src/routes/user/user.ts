
// import { db } from '../../db';
import express from 'express';
import { cLog } from '../../utils/logger';
import verify from '../../utils/verify';
import jwt_decoder from '../../utils/jwt_decoder';
import statusCode from '../../utils/statusCodeSender';
import bcrypt from "bcrypt";
import md5 from 'md5';
import { PrismaClient, users } from '@prisma/client'
import { getUUIDBasedOnGameName } from '../../utils/lol_api';
export const userRoute = express.Router();

const prisma = new PrismaClient()

userRoute.post('/linkme', async (req, res) => {

    const userLink: any = {
        gameName: req.body.gameName,
        tagLine: req.body.TagLine,
        discordId: req.body.discordId
    }

    if (typeof userLink.gameName === 'undefined') {
        return res.send({ statusCode: 1, message: "GameName Undefined" })
    }
    if (typeof userLink.tagLine === 'undefined') {
        return res.send({ statusCode: 1, message: "TagLine Undefined" })
    }
    if (typeof userLink.discordId === 'undefined') {
        return res.send({ statusCode: 1, message: "discordId Undefined" })
    }

    let foundUser: users[] | Boolean = false
    if (userLink.discordId !== null) {

        foundUser = await prisma.users.findMany({ where: { discord_id: userLink.discordId } });
    } else {

        foundUser = await prisma.users.findMany({ where: { discord_id: userLink.discordId } });
    }


    if (!foundUser || foundUser.length === 0) {
        // User not found, add the user to the users table
        const riotResults: any = await getUUIDBasedOnGameName(userLink)
        //TODO Add a create function to call instead of rewrtiing this
        const newUser = await prisma.users.create({
            data: {
                game_name: userLink.gameName,
                tag_line: userLink.tagLine,
                discord_id: userLink.discordId,
                uuid: riotResults.puuid
            }
        });
        console.log("New user added:", newUser);
    } else {
        // User found, handle accordingly
    }



    return res.send({ statusCode: 0, users: foundUser })
})

userRoute.post('/', async (req, res) => {

    return res.send({ statusCode: 0 });
})

