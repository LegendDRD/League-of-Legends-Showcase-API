
// import { db } from '../../db';
import express from 'express';
import { cLog } from '../../utils/logger';
import verify from '../../utils/verify';
import jwt_decoder from '../../utils/jwt_decoder';
import statusCode from '../../utils/statusCodeSender';
import bcrypt from "bcrypt";
import md5 from 'md5';
import { PrismaClient, users } from '@prisma/client'
import { getUUIDBasedOnGameName } from '../../utils/lol_api';
import { createUser } from '../../db';
export const userRoute = express.Router();
const prisma = new PrismaClient()


// userRoute.post('/linkme', async (req, res) => {

// })


