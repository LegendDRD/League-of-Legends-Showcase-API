import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import statusCodeSender from "./utils/statusCodeSender";
statusCodeSender.start();
import { auth } from "./routes/auth/auth";
import { userRoute } from "./routes/user/user";


if (!process.env.PORT) {
    console.log("Server Closed \nPlease add a .end")
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/v1", auth);
app.use("/v1/user", userRoute);

app.use(errorHandler);
app.use(notFoundHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});