import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import { router as vote } from "./api/vote";
import { router as user } from "./api/user";
import { router as pic } from "./api/picture";
import { router as upload } from "./api/upload";

export const app = express();

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(
    cors({
        origin: "*",
    })
);
app.use("/user",user);
app.use("/pic",pic);
app.use("/vote",vote);
app.use("/upload",upload);