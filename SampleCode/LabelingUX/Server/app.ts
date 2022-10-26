import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import routesIndex from "./routes";
import localFileStorage from "./routes/localFileStorage";
import errorMiddleware from "./middlewares/errors";
import cors from "cors";

const app = express();

dotenv.config({ path: ".env" });

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: process.env.SITE_URL,
    })
);
app.use("/", routesIndex);
app.use("/files", localFileStorage);

// Middleware to handle errors
app.use(errorMiddleware);

export default app;
