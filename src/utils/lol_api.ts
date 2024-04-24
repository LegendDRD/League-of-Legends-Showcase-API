import axios from 'axios';
import { stroreMatchDataToDB } from '../db';
export async function getUUIDBasedOnGameName(userRequest: UserLink) {
    try {
        let results = await axios.get(`${process.env.LOL_URL}/riot/account/v1/accounts/by-riot-id/${userRequest.game_name}/${userRequest.tag_line}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })
        console.log(results.data);
        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

export async function getGetMatchesFromUUID(uuid: string) {
    try {
        let results = await axios.get(`${process.env.LOL_URL}/lol/match/v5/matches/by-puuid/${uuid}/ids`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })
        console.log(results.data);
        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

export async function getGetMatchDataFromMatchID(matchId: string) {
    try {
        let results = await axios.get(`${process.env.LOL_URL}/lol/match/v5/matches/${matchId}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })
        console.log(results.data);
        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

export async function stroreMatchData(uuid: string) {
    try {
        let matchIdArray = await getGetMatchesFromUUID(uuid)

        for (let i = 0; i < matchIdArray.length; i++) {
            const element = matchIdArray[i];
            let matchData = getGetMatchDataFromMatchID(element)
            stroreMatchDataToDB({ match_id: "", queue_id: "", game_start_timestamp: "", game_end_timestamp: "" })
        }

    } catch (err: any) {
        console.log(err);
        return null
    }
}

stroreMatchData("dHkNBofSqunlhXDZwSXMKgfk5kRRssq6OdSBmIYhDKmgL4JAJhFv8BEpVolfQZdHzy_5bLPZV8OTJw")