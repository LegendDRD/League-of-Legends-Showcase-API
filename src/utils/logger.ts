import fs from 'fs';
import { db } from '../db';
// import {logEmail} from './emailer.js';

// log function to replace console log as well being able to be configered in the env to email and write logs to the database
export function cLog(src: string, info: string, errorLevel: string = "debug", cLogTrue: boolean = true) {

    // console.log("ending");

    const writeFileLevel = process.env.FILE_LEVEL || "critical";
    const sendEmail = process.env.EMAIL_LEVEL || "critical";
    const logData = ` \nErrorLevel: ${errorLevel} \n\tSource: ${src} \n\tINFO: ${info}`;
    if (cLogTrue) {
        console.log(logData);
    }


    switch (writeFileLevel) {
        case "debug": writeToFile(src, info, errorLevel);
            break;
        case "warning": if (errorLevel !== "debug") { writeToFile(src, info, errorLevel); }
            break;
        case "error": if (errorLevel !== "debug" && errorLevel !== "warning") { writeToFile(src, info, errorLevel); }
            break;
        case "critical": if (errorLevel === "critical") { writeToFile(src, info, errorLevel); }
            break;
    }
    // switch (sendEmail) {
    //     case "debug": logEmail(logData)
    //         break;
    //     case "warning": if (errorLevel !== "debug") { logEmail(logData) }
    //         break;
    //     case "error": if (errorLevel !== "debug" && errorLevel !== "warning") { logEmail(logData); }
    //         break;
    //     case "critical": if (errorLevel === "critical") { logEmail(logData) }
    //         break;
    // }

}
export async function auditLog(userId: number, action: string) {
    const user = await db.asyncPool(`SELECT * from users where id=?`, [userId]);
    const results = await db
        .asyncPool(`INSERT INTO audit (from_user, user_id, action) VALUES ('${user[0].name_first} ${user[0].name_last}','${userId}', '${action}')`, []);
}

function writeToFile(src: string, info: string, errorLevel: string = "debug") {
    if (!fs.existsSync(`./logs`)) {
        fs.mkdirSync(`./logs`);
    }

    const logData = `ErrorLevel: ${errorLevel} \n\tSource: ${src} \n\t INFO: ${info} \n\n`;
    fs.appendFile("./logs/errorlogs.txt", logData, (err) => {
        if (err) {
            return console.log(err);
        }

    });
}

function writeToEmailFile(logData: string) {
    if (!fs.existsSync(`./logs`)) {
        fs.mkdirSync(`./logs`);
    }

    // const logData = `ErrorLevel: ${errorLevel} \n\tSource: ${src} \n\t INFO: ${info} \n\n`;
    fs.appendFile("./logs/emaillogs.txt", logData, (err) => {
        if (err) {
            return console.log(err);
        }

    });
}


