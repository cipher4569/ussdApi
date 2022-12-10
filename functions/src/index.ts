import * as functions from "firebase-functions";
import express, {Express} from "express";
import cors from "cors";
import routes from "./routes/v1/routes";

const app: Express = express();

app.use(cors({origin: true}));

app.use("/v1/ussd", routes);

export const api = functions.https.onRequest(app);
