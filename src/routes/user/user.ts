
import { db } from '../../db';
import express from 'express';
import { cLog } from '../../utils/logger';
import verify from '../../utils/verify';
import jwt_decoder from '../../utils/jwt_decoder';
import { User } from '../../model_types/user_types';
import statusCode from '../../utils/statusCodeSender';
import bcrypt from "bcrypt";
import md5 from 'md5';
export const userRoute = express.Router();

userRoute.get('/', verify, async (req, res) => {

    const jwtUser: any = await jwt_decoder(req);
    const UserResult = await db.asyncPool(`SELECT * FROM users WHERE id=?`, [jwtUser.id]);
    delete UserResult[0].password;
    const UserAnResult = await db.asyncPool(`SELECT * FROM users_analytics WHERE user_id=?`, [jwtUser.id]);

    res.send({ statusCode: 0, user: UserResult[0], analytics: UserAnResult[0] });

})

userRoute.post('/', async (req, res) => {
    cLog("adding User", JSON.stringify(req.body), 'debug', false);

    const confirmPassword = req.body.confirm_password;

    const user: User = {
        email: req.body.email,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        confirm_password: req.body.confirm_password
    }

    if (typeof user.email === 'undefined') {
        return res.send(statusCode.CodeSender("U1"))
    }
    if (typeof user.password === 'undefined') {
        return res.send(statusCode.CodeSender("U2"))
    }
    if (typeof user.first_name === 'undefined') {
        return res.send(statusCode.CodeSender("U3"))
    }
    if (typeof user.last_name === 'undefined') {
        return res.send(statusCode.CodeSender("U4"))
    }

    if (typeof confirmPassword === 'undefined') {
        return res.send(statusCode.CodeSender("U5"))
    }
    if (user.password !== confirmPassword) {
        return res.send(statusCode.CodeSender("U6"))
    }

    const checkForUser: { email: string }[] = await db.asyncPool(`SELECT  users.email FROM users WHERE users.email = ? `, [user.email]);

    if (checkForUser.length > 0) {
        if (String(checkForUser[0].email) === String(user.email)) {
            return res.send(statusCode.CodeSender("U7"))
        }
    }

    const hash = bcrypt.hashSync(user.password.toString(), 10);

    const userRoleId = await db.asyncPool(`SELECT id FROM roles WHERE role_name = ?`, ['user'])

    if (userRoleId.length === 0) {
        cLog('Adding user', `Failed to find user role ${JSON.stringify(userRoleId)}`, 'critical');
        return res.send(statusCode.CodeSender("R1"))
    }

    const result = await db.asyncPool(`INSERT INTO users (users.first_name, users.last_name, users.email, users.password,users.role_id) VALUES (?,?,?,?,?);`, [user.first_name, user.last_name, user.email, hash, userRoleId[0].id]);

    if (result.affectedRows === 1) {

        const checkUser: User[] = await db.asyncPool(`SELECT users.id,users.password, users.email, users.updated_at FROM users WHERE users.email = ?`, [user.email]);

        if (checkUser.length !== 1) {
            return res.status(418).send(statusCode.CodeSender("U6"))
        }
        const createdAnalytics = await createUserAnalytic(checkUser[0])
        if (!createdAnalytics) { return res.status(418).send(statusCode.CodeSender("A1")) }

        const stateToken = md5(`${checkUser[0].email}-${checkUser[0].password}-${checkUser[0].updated_at}`);

        const id = checkUser[0].id;

        // verifyEmail(checkUser[0].email, { id, stateToken });

        return res.send(statusCode.CodeSender("U0"));

    } else {
        cLog("Adding user", `USER couldnt be added ${JSON.stringify(user)}`, 'critical')
        return res.send(statusCode.CodeSender("U12"));
    }

})

async function createUserAnalytic(user: User) {

    const result = await db.asyncPool(`INSERT INTO users_analytics (user_id, last_online, is_online) VALUES (?,?,1);`, [user.id, new Date(Date.now())]);
    console.log(result);
    if (result.affectedRows === 1) {
        return true;
    }
    return false;
}
