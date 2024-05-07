
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
import { checkForuser, checkForuserDiscord, createUser, getAllLast20MatchesbyUuid } from '../../db';
export const userRoute = express.Router();
const prisma = new PrismaClient()


userRoute.post('/matchhistory', async (req, res) => {
    let userName = {
        game_name: req.body.userName,
        tag_line: req.body.tagLine,
        discord_user_id: "",
        discord_id: ""
    };

    let userDBData: any = await checkForuser(userName)

    if (!userDBData) {
        console.log('User Not found')
        return res.sendStatus(404)
    }

    let matchHistory = await getAllLast20MatchesbyUuid(userDBData.uuid);

    let newMatchData = []
    if (!matchHistory) {
        return res.send({ message: "No matches found" })
    }
    for (let i = 0; i < matchHistory.length; i++) {
        newMatchData.push({
            champion: matchHistory[i].champion_name,
            win: matchHistory[i].win,
            lane: matchHistory[i].lane,
            kills: matchHistory[i].kills,
            deaths: matchHistory[i].deaths,
            assists: matchHistory[i].assists,
            kda: (matchHistory[i].kills + matchHistory[i].assists) / matchHistory[i].deaths,
            gold: matchHistory[i].gold_earned,
            damageDone: matchHistory[i].true_damage_dealt,
            visionScore: matchHistory[i].vision_score,
            surrender: matchHistory[i].game_ended_in_surrender

        })
    }

    return res.send({ message: "MatchHistory", results: newMatchData })

})


