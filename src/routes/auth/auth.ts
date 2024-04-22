import jwt from 'jsonwebtoken';
// import { db } from '../../db';
import md5 from 'md5';
import express from 'express';
import { cLog } from '../../utils/logger';
import verify from '../../utils/verify';
// import statusCode from '../utils/statusCodeSender'
export const auth = express.Router();

// let refreshTokens: any[] = [];

// const accessTokenSECRET: any = process.env.ACCESS_TOKEN_SECRET;
// const refreshTokenSECRET: any = process.env.REFRESH_TOKEN_SECRET;

// auth.post('/user/login', async (req, res) => {
//     // Authenticate User

//     const email: string = req.body.email;
//     const password: string = req.body.password;

//     cLog(`Login from email:`, `${email}`, 'debug', false);
//     let dbUser = [];

//     try {
//         dbUser = await db.AuthGetUser(email, String(password));

//     }
//     catch (err) {
//         console.log(err)
//         return res.sendStatus(500);
//     }

//     if (dbUser) {
//         const user =
//         {
//             email,
//             id: dbUser.id,
//             first_name: dbUser.first_name,
//             last_name: dbUser.last_name,
//             role_id: dbUser.role_id,
//             user_status: dbUser.status
//         }

//         const state = md5(`${dbUser.id}${dbUser.email}${dbUser.password}${dbUser.updated_at}`);

//         const userRefresh =
//         {
//             id: dbUser.id,
//             email,
//             state,
//             user_status: dbUser.status

//         }

//         const accessToken = generateAccessToken(user);

//         const refreshToken = generateRefreshToken(userRefresh);

//         refreshTokens.push(refreshToken);
//         res.json({ accessToken, refreshToken });


//     }
//     else {
//         return res.sendStatus(401);
//     }
// })

// auth.post('/token', (req, res) => {

//     const refreshToken = req.body.token
//     if (refreshToken === null) return res.sendStatus(401)
//     if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

//     jwt.verify(refreshToken, refreshTokenSECRET, (err: any, user: any) => {
//         if (err) {
//             return res.sendStatus(403)
//         }
//         const accessToken = generateAccessToken({ email: user.email, id: user.id, user_status: user.user_status, firstname: user.firstname, lastname: user.lastname, role_id: user.role_id })
//         res.json({ accessToken })
//     })
// });

// auth.post('/refresh', async (req, res) => {

//     let refreshToken = req.body.token;
//     if (refreshToken === null) return res.sendStatus(401);

//     const expirationCheck: any = jwt.verify(refreshToken, refreshTokenSECRET, (err: any, decodedtoken: any) => {

//         if (err) {
//             return false;
//         }
//         return true;
//     })
//     if (expirationCheck === false) { return res.sendStatus(401) }


//     const decoded: any = jwt.decode(refreshToken);
//     let refreshCheck = false;
//     if (!decoded.id) {
//         return res.sendStatus(401)
//     }

//     if (decoded.id) {
//         refreshCheck = await db.AuthCheckRefreshtoken(decoded.id, decoded.state);

//     } else {
//         return res.sendStatus(401)
//     }

//     if (refreshCheck) {

//         const dbUser = await db.asyncPool(`SELECT * FROM users WHERE id =?`, [decoded.id]);

//         const userAccess =
//         {
//             email: dbUser[0].email,
//             id: dbUser[0].id,
//             firstname: dbUser[0].name_first,
//             lastname: dbUser[0].name_last,
//             role_id: dbUser[0].role_id,
//             user_status: dbUser[0].is_activated

//         }

//         const state = md5(`${dbUser[0].id}${dbUser[0].email}${dbUser[0].password}${dbUser[0].updated_at}`);

//         const userRefresh =
//         {
//             id: dbUser[0].id,
//             email: dbUser[0].email,
//             state,

//             user_status: dbUser[0].is_activated

//         }

//         const accessToken = generateAccessToken(userAccess)
//         refreshToken = jwt.sign(userRefresh, refreshTokenSECRET, { expiresIn: '1d' })
//         refreshTokens.push(refreshToken);
//         res.json({ accessToken, refreshToken })
//     }
//     else {
//         return res.sendStatus(401);
//     }
// });

// auth.delete('/logout', (req, res) => {
//     refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//     res.sendStatus(204)
// });

// export function generateAccessToken(user: {}) {

//     const expiresIn = '1d';

//     return jwt.sign(user, accessTokenSECRET, { expiresIn })
// }
// export function generateRefreshToken(user: {}) {

//     const expiresIn = '1d';

//     return jwt.sign(user, refreshTokenSECRET, { expiresIn });
// }