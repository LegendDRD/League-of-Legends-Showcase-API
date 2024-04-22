import fs from 'fs';
let codes: any;
// pulls the statuscodejson and fills a varible with a list of codes to be used over the project
async function start() {

    try {

        codes = fs.readFileSync(`${process.cwd()}/src/utils/statusCodes.json`, { encoding: 'utf8' });
        codes = JSON.parse(codes);
        console.log(">\u001B[36m Status Codes Loaded\u001B[0m\u001B[40m");
        if (!process.env.PORT) {
            throw new Error("DOTENV NOT SATIFIED");
        } else {
            console.log(">\u001B[36m DOTENV SATIFIED\u001B[0m\u001B[40m\n");
        }
    } catch (err) {
        if (err) throw err;
    }

}


export = {
    CodeSender: (statusCode: any) => {
        if (process.env.MODE === "DEV") {

            if (statusCode in codes) {
                return { description: codes[`${statusCode}`], statusCode }
            }
            return { statusCode };

        } else {
            return { statusCode };
        }


    },
    start
}