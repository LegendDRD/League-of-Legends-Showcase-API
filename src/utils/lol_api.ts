import axios from 'axios';
export async function getUUIDBasedOnGameName(userRequest: any) {
    await axios.get(`${process.env.LOL_URL}`)
}