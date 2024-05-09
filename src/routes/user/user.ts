
// import { db } from '../../db';
import express from 'express';
import { cLog } from '../../utils/logger';
import verify from '../../utils/verify';
import jwt_decoder from '../../utils/jwt_decoder';
import statusCode from '../../utils/statusCodeSender';
import bcrypt from "bcrypt";
import md5 from 'md5';
import { PrismaClient, users } from '@prisma/client'
import { getGetRankDataFromSummonerID, getUUIDBasedOnGameName } from '../../utils/lol_api';
import { checkForuser, checkForuserDiscord, createUser, getAllLast20MatchesbyUuid } from '../../db';
export const userRoute = express.Router();
const prisma = new PrismaClient()


userRoute.post('/matchhistory', async (req, res) => {
    const userName = {
        game_name: req.body.userName,
        tag_line: req.body.tagLine,
        discord_user_id: "",
        discord_id: ""
    };

    const userDBData: any = await checkForuser(userName)

    if (!userDBData) {
        console.log('User Not found')
        return res.sendStatus(404)
    }

    const matchHistory = await getAllLast20MatchesbyUuid(userDBData);

    const newMatchData = []
    if (!matchHistory) {
        return res.send({ message: "No matches found" })
    }
    for (let i = 0; i < matchHistory.length; i++) {


        let queueType = "normal"; // Default queue ID for normal games
        switch (matchHistory[i].match?.queue_id) {
            case "420":
                queueType = "Solo";
                break;
            case "440":
                queueType = "Flex";
                break;
            case "400":
                queueType = "Normal";
                break;
            case "450":
                queueType = "Aram";
                break;
            default:
                queueType = "Custom Game Mode";
                break;
        }
        newMatchData.push({
            champion: matchHistory[i].champion_name,
            win: matchHistory[i].win,
            lane: matchHistory[i].lane,
            kills: matchHistory[i].kills,
            deaths: matchHistory[i].deaths,
            assists: matchHistory[i].assists,
            kda: (matchHistory[i].kills + matchHistory[i].assists) / matchHistory[i].deaths,
            gold: matchHistory[i].gold_earned,
            damageDone: matchHistory[i].total_damage_dealt,
            visionScore: matchHistory[i].vision_score,
            surrender: matchHistory[i].game_ended_in_surrender,
            queueType

        })
    }

    return res.send({ message: "MatchHistory", results: newMatchData })

})
userRoute.post('/rankstats', async (req, res) => {
    const userName = {
        game_name: req.body.userName,
        tag_line: req.body.tagLine,
        discord_user_id: "",
        discord_id: ""
    };

    const userDBData: any = await checkForuser(userName)

    if (!userDBData) {
        console.log('User Not found')
        return res.sendStatus(404)
    }

    const matchHistory = await getAllLast20MatchesbyUuid(userDBData);

    if (!matchHistory) {
        return res.send({ message: "No matches found" })
    }
    let summonerId;
    const rankSoloWins = 0;
    const rankSoloTotalMatches = 0;

    const rankFlexWins = 0;
    const rankFlexTotalMatches = 0;

    for (let i = 0; i < 1; i++) {

        summonerId = matchHistory[i].summoner_id
        const queueType = "normal"; // Default queue ID for normal games

        // switch (matchHistory[i].match?.queue_id) {
        //     case "420":
        //         queueType = "Solo";
        //         if (matchHistory[i].win) {
        //             rankSoloWins++
        //         }
        //         rankSoloTotalMatches++
        //         break;
        //     case "440":
        //         queueType = "Flex";
        //         if (matchHistory[i].win) {
        //             rankFlexWins++
        //         }
        //         rankFlexTotalMatches++
        //         break;
        //     default:
        //         queueType = "Custom Game Mode";
        //         break;
        // }
    }

    const rankData: any = {
        flex: {},
        solo: {}
    }
    if (summonerId) {

        const lolData = await getGetRankDataFromSummonerID(summonerId);
        console.log(lolData)
        lolData.forEach((rankResults: any) => {

            switch (rankResults.queueType) {
                case "RANKED_FLEX_SR":
                    rankData.flex = rankResults
                    rankData.flex.icon = getRankIcon(rankData.flex.tier)
                    break;
                case "RANKED_SOLO_5x5":
                    rankData.solo = rankResults
                    rankData.solo.icon = getRankIcon(rankData.solo.tier)
                    break;
            }
        });

        return res.send({ message: "MatchHistory", results: rankData })
    }

    return res.send({ message: "Basic Stats", results: rankData })


})


function getRankIcon(queueType: string) {
    switch (queueType.toLowerCase()) {
        case "iron":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378307/lol%20Ranks/Rank_Iron_nfndf1.png"
            break;
        case "bronze":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378307/lol%20Ranks/Rank_Bronze_udqas6.png"
            break;
        case "silver":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378308/lol%20Ranks/Rank_Silver_u7obuu.png"
            break;
        case "gold":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378308/lol%20Ranks/Rank_Gold_byfrar.png"
            break;
        case "emerald":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378308/lol%20Ranks/Rank_Emerald_yrs2nd.png"
            break;
        case "platinum":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378308/lol%20Ranks/Rank_Platinum_tggvaf.png"
            break;
        case "diamond":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378309/lol%20Ranks/Rank_Diamond_qymbxi.png"
            break;
        case "master":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378308/lol%20Ranks/Rank_Master_ht1nfk.png"
            break;
        case "grandmaster":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378309/lol%20Ranks/Rank_Grandmaster_ltjmcj.png"
            break;
        case "challenger":
            return "https://res.cloudinary.com/drdportfolio/image/upload/v1714378309/lol%20Ranks/Rank_Challenger_dpux4x.png"
            break;
    }

}

