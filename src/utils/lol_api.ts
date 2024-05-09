import axios from 'axios';
import { checkForMatch, storeMatchDataToDB, storeParticipantDataToDB } from '../db';
import { UserLink } from '../interfaces/InterfaceAndTypes';
import delay from 'delay';
export async function getUUIDBasedOnGameName(userRequest: UserLink) {
    try {
        const results = await axios.get(`${process.env.LOL_URL}/riot/account/v1/accounts/by-riot-id/${userRequest.game_name}/${userRequest.tag_line}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })
        // console.log(results.data);
        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

export async function getGetMatchesFromUUID(uuid: string) {
    try {
        const startDate = getStartOfCurrentMonth();
        // console.log("Search Date ", startDate)
        const results = await axios.get(`${process.env.LOL_URL}/lol/match/v5/matches/by-puuid/${uuid}/ids?count=50&startTime=${startDate}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })

        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

export async function getGet20MatchesFromUUID(uuid: string) {
    try {
        const startDate = getStartOfCurrentMonth();
        // console.log("Search Date ", startDate)
        const results = await axios.get(`${process.env.LOL_URL}/lol/match/v5/matches/by-puuid/${uuid}/ids?count=20&startTime=${startDate}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })

        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

export async function getGetMatchDataFromMatchID(matchId: string) {
    try {
        const results = await axios.get(`${process.env.LOL_URL}/lol/match/v5/matches/${matchId}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })
        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

export async function storeMatchData(uuid: string) {
    try {
        const matchIdArray = await getGetMatchesFromUUID(uuid)
        await delay(200);
        for (let i = 0; i < matchIdArray.length; i++) {
            const matchId = matchIdArray[i];
            const found = await checkForMatch(matchId)


            if (!found) {
                console.log('getting Match', matchId)
                await delay(2000);
                const matchData = await getGetMatchDataFromMatchID(matchId)
                await storeMatchDataToDB({
                    match_id: matchData.metadata.matchId,
                    queue_id: matchData.info.queueId.toString(),
                    game_start_timestamp: matchData.info.gameStartTimestamp.toString(),
                    game_end_timestamp: matchData.info.gameEndTimestamp.toString()
                })
                for (let j = 0; j < matchData.info.participants.length; j++) {
                    const element = matchData.info.participants[j];

                    await storeParticipantDataToDB({
                        uuid: element.puuid,
                        assists: element.assists,
                        match_id: matchData.metadata.matchId,
                        champion_name: element.championName,
                        champion_level: element.champLevel,
                        champion_experience: element.champExperience,
                        damage_dealt_to_buildings: element.damageDealtToBuildings,
                        damage_dealt_to_objectives: element.damageDealtToObjectives,
                        damage_dealt_to_turrets: element.damageDealtToTurrets,
                        damage_self_mitigated: element.damageSelfMitigated,
                        deaths: element.deaths,
                        double_kills: element.doubleKills,
                        dragon_kills: element.dragonKills,
                        first_blood_assist: element.firstBloodAssist,
                        first_blood_kill: element.firstBloodKill,
                        first_tower_assist: element.firstTowerAssist,
                        first_tower_kill: element.firstTowerKill,
                        game_ended_in_surrender: element.gameEndedInSurrender,
                        gold_earned: element.goldEarned,
                        gold_spent: element.goldSpent,
                        individual_position: element.individualPosition,
                        inhibitor_kills: element.inhibitorKills,
                        inhibitor_takedowns: element.inhibitorTakedowns,
                        killing_sprees: element.killingSprees,
                        kills: element.kills,
                        lane: element.lane,
                        largest_critical_strike: element.largestCriticalStrike,
                        largest_killing_spree: element.largestKillingSpree,
                        largest_multikill: element.largestMultiKill,
                        longest_time_spent_living: element.longestTimeSpentLiving,
                        magic_damage_dealt: element.magicDamageDealt,
                        magic_damage_dealt_to_champions: element.magicDamageDealtToChampions,
                        magic_damage_taken: element.magicDamageTaken,
                        neutral_minions_killed: element.neutralMinionsKilled,
                        penta_kills: element.pentaKills,
                        physical_damage_dealt: element.physicalDamageDealt,
                        physical_damage_dealt_to_champions: element.physicalDamageDealtToChampions,
                        physical_damage_taken: element.physicalDamageTaken,
                        quadra_kills: element.quadraKills,
                        lane_role: element.role,
                        summoner_id: element.summonerId,
                        team_position: element.teamPosition,
                        total_damage_dealt: element.totalDamageDealt,
                        total_damage_dealt_to_champions: element.totalDamageDealtToChampions,
                        total_damageshielded_on_teammates: element.totalDamageShieldedOnTeammates,
                        total_damage_taken: element.totalDamageTaken,
                        total_heal: element.totalHeal,
                        total_heals_on_teammates: element.totalHealsOnTeammates,
                        total_minions_killed: element.totalMinionsKilled,
                        total_time_CC_dealt: element.totalTimeCCDealt,
                        total_units_healed: element.totalUnitsHealed,
                        triple_kills: element.tripleKills,
                        true_damage_dealt: element.trueDamageDealt,
                        true_damage_dealt_to_champions: element.trueDamageDealtToChampions,
                        true_damage_taken: element.trueDamageTaken,
                        turret_kills: element.turretKills,
                        turret_takedowns: element.turretTakedowns,
                        turrets_lost: element.turretsLost,
                        unreal_kills: element.unrealKills,
                        vision_wards_bought_in_game: element.visionWardsBoughtInGame,
                        vision_score: element.visionScore,
                        wards_killed: element.wardsKilled,
                        wards_placed: element.wardsPlaced,
                        win: element.win
                    })
                }
            }
        }
        // console.log('getting Matches Done')
        return true
    } catch (err: any) {
        // console.log(err);
        console.log(err.status);
        return false
    }
}

export async function getGetRankDataFromSummonerID(summonerId: string) {
    try {
        const results = await axios.get(`${process.env.LOL_URL_LEAGUE}/lol/league/v4/entries/by-summoner/${summonerId}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })
        return results.data

    } catch (err: any) {
        console.log(err);
        return null
    }
}

function getStartOfCurrentMonth() {
    // Get the current date
    const currentDate = new Date();

    // Set the date to the first day of the month
    currentDate.setDate(1);

    // Set the time to midnight (start of the day)
    currentDate.setHours(0, 0, 0, 0);

    // Get the milliseconds of the start of the month
    const startOfMonthMilliseconds = currentDate.getTime();
    // console.log("Milliseconds of the start of the month:", startOfMonthMilliseconds);
    return startOfMonthMilliseconds / 1000

}
