
// import { db } from '../../db';
import express from 'express';
import { cLog } from '../../utils/logger';
import verify from '../../utils/verify';
import jwt_decoder from '../../utils/jwt_decoder';
import statusCode from '../../utils/statusCodeSender';
import bcrypt from "bcrypt";
import md5 from 'md5';
import { PrismaClient } from '@prisma/client'
export const userRoute = express.Router();

const prisma = new PrismaClient()

userRoute.get('/', async (req, res) => {

    // const jwtUser: any = await jwt_decoder(req);
    // const UserResult = await db.asyncPool(`SELECT * FROM users WHERE id=?`, [jwtUser.id]);
    // delete UserResult[0].password;
    // const UserAnResult = await db.asyncPool(`SELECT * FROM users_analytics WHERE user_id=?`, [jwtUser.id]);

    // res.send({ statusCode: 0, user: UserResult[0], analytics: UserAnResult[0] });

    // const allUsers = await prisma.findMany({
    //     include: {
    //       posts: true,
    //       profile: true,
    //     },
    //   })
    const allUsers = await prisma.users.findMany({});

    return res.send({ statusCode: 0, users: allUsers })
})

userRoute.post('/', async (req, res) => {

    return res.send({ statusCode: 0 });
})

