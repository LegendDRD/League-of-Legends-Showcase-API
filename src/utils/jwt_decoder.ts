import jwt from 'jsonwebtoken';
import { cLog } from './logger';

// Middleware that Decodes the access token to give out the users id

export = async (req: any) => {
    return new Promise(async (resolve, reject) => {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return resolve(false);
        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "", (err: any, user: any) => {

                if (err) {
                    cLog("jsonDecoder script", `verify failed ${err}`, 'criticle')

                    return resolve(false)
                }

                cLog("jsonDecoder script", `verify  ${JSON.stringify(user)}`, 'debug', false)

                return resolve(user)
            })
        }
        catch (err) {
            cLog("jsonDecoder script", `verify failed ${err}`, 'warning')
            return resolve(false);
        }
    })
}


