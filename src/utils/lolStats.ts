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
        const element = matches[i]
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
        const element = matches[i]
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
        const element = matches[i]
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
        const element = matches[i]
        if (element.gold_earned !== null) {
            Total += element.gold_earned;
        }
    }

    Avg = (Total / matches.length)

    return Avg
}


export async function AvgDurationOfGame(matches: participantsWithmatchAndQueue[]) {
    // Variable to store the sum of durations
    let totalDuration = 0;

    // Calculate the duration of each game and sum them up
    matches.forEach(game => {
        const duration = Number(game.match?.game_end_timestamp) - Number(game.match?.game_start_timestamp);
        totalDuration += duration;
    });

    // Calculate the average duration
    const averageDuration = totalDuration / matches.length;

    return averageDuration;

}

export async function AvgKillsGame(matches: participantsWithmatchAndQueue[]) {
    // Variable to store the sum of durations
    let totalKills = 0;

    // Calculate the duration of each game and sum them up
    matches.forEach(game => {
        const kills = Number(game?.kills)
        totalKills += kills;
    });

    // Calculate the average duration
    const averageDuration = totalKills / matches.length;

    return averageDuration;

}
export async function AvgDeathsGame(matches: participantsWithmatchAndQueue[]) {
    // Variable to store the sum of durations
    let total = 0;

    // Calculate the duration of each game and sum them up
    matches.forEach(game => {
        const deaths = Number(game?.deaths)
        total += deaths;
    });

    // Calculate the average duration
    const averageDuration = total / matches.length;

    return averageDuration;

}
export async function TotaPentas(matches: participantsWithmatchAndQueue[]) {
    // Variable to store the sum of durations
    let total = 0;

    // Calculate the duration of each game and sum them up
    matches.forEach(game => {
        const pentas = Number(game?.penta_kills)
        total += pentas;
    });

    return total;

}
export async function TotaQuadrs(matches: participantsWithmatchAndQueue[]) {
    // Variable to store the sum of durations
    let total = 0;

    // Calculate the duration of each game and sum them up
    matches.forEach(game => {
        const quadras = Number(game?.quadra_kills)
        total += quadras;
    });

    return total;

}
export async function TripleKills(matches: participantsWithmatchAndQueue[]) {
    // Variable to store the sum of durations
    let total = 0;

    // Calculate the duration of each game and sum them up
    matches.forEach(game => {
        const tripleKills = Number(game?.triple_kills)
        total += tripleKills;
    });

    return total;

}