import axios from 'axios';
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