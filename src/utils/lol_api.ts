import axios from 'axios';
export async function getUUIDBasedOnGameName(userRequest: any) {
    try {
        let results = await axios.get(`${process.env.LOL_URL}/riot/account/v1/accounts/by-riot-id/${userRequest.gameName}/${userRequest.tagLine}`, {
            headers: { 'X-Riot-Token': process.env.LOL_API_KEY }
        })
        console.log(results.data);
        return results.data

    } catch (err: any) {
        console.log(err);
    }
}