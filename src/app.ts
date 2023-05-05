const dotenv = require("dotenv");
dotenv.config();

import express, { Express, NextFunction, Request, Response } from "express";
import dbConnect from "./db/conn";
import cors from "cors";
import ErrorHandler from "./middlewares/ErrorHandler";
import helmet from "helmet";
import compression from "compression";

const app: Express = express();

//router
const user = require("./routes/user");
const vote = require("./routes/vote");

//port
const port = 3001;

//cors
const whitelist = [
  "http://localhost:3000",
  "https://votehelper.herokuapp.com/",
  "http://localhost:80",
];
app.use(cors({}));
app.use(helmet());
app.use(compression());

app.use("/", async (req: Request, res: Response, next: NextFunction) => {
  await dbConnect();
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Ts express");
});

app.use("/user", user);
app.use("/vote", vote);

app.use(ErrorHandler);

app.listen(port, async () => {
  await dbConnect();
  console.log("hello world");
});

//mongodb
