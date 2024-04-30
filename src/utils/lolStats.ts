import { participantsWithmatchAndQueue } from "../interfaces/InterfaceAndTypes";

export async function CalWinRates(matches: participantsWithmatchAndQueue[]) {
    let wins = 0;
    let overAllWinRate = 0
    if (matches.length < 1) {
        return { overAllWinRate }
    }

    for (let i = 0; i < matches.length; i++) {
        if (matches[i].win) {
            wins++;
        }
    }

    overAllWinRate = (wins / matches.length) * 100

    return overAllWinRate
}

export async function CalSurrRates(matches: participantsWithmatchAndQueue[]) {
    let surrenders = 0;

    for (let i = 0; i < matches.length; i++) {
        if (matches[i].game_ended_in_surrender) {
            surrenders++;
        }
    }

    return surrenders
}

export async function CalVisionRates(matches: participantsWithmatchAndQueue[]) {
    let visionTotal = 0;
    let visionAvg = 0
    if (matches.length < 1) {
        return visionAvg
    }

    for (let i = 0; i < matches.length; i++) {
        let element = matches[i]
        if (element.vision_score !== null) {
            visionTotal += element.vision_score;
        }
    }

    visionAvg = (visionTotal / matches.length)

    return visionAvg
}

export async function AvgDamageDealtTochampions(matches: participantsWithmatchAndQueue[]) {
    let damageTotal = 0;
    let damageAvg = 0
    if (matches.length < 1) {
        return damageAvg
    }

    for (let i = 0; i < matches.length; i++) {
        let element = matches[i]
        if (element.total_damage_dealt_to_champions !== null) {
            damageTotal += element.total_damage_dealt_to_champions;
        }
    }

    damageAvg = (damageTotal / matches.length)

    return damageAvg
}

export async function AvgMinionsKilled(matches: participantsWithmatchAndQueue[]) {
    let Total = 0;
    let Avg = 0
    if (matches.length < 1) {
        return Avg
    }

    for (let i = 0; i < matches.length; i++) {
        let element = matches[i]
        if (element.total_minions_killed !== null) {
            Total += element.total_minions_killed;
        }
    }

    Avg = (Total / matches.length)

    return Avg
}

export async function AvgGoldEarned(matches: participantsWithmatchAndQueue[]) {
    let Total = 0;
    let Avg = 0
    if (matches.length < 1) {
        return Avg
    }

    for (let i = 0; i < matches.length; i++) {
        let element = matches[i]
        if (element.gold_earned !== null) {
            Total += element.gold_earned;
        }
    }

    Avg = (Total / matches.length)

    return Avg
}