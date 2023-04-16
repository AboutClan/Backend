const dotenv = require("dotenv");
dotenv.config();

import express, { Express, NextFunction, Request, Response } from "express";
import dbConnect from "./db/conn";
import cors from "cors";

const app: Express = express();

//router
const user = require("./routes/user");
const vote = require("./routes/vote");

//port
const port = 3001;

const whitelist = [
  "http://localhost:3000",
  "https://votehelper.herokuapp.com/",
  "http://localhost:80",
];
app.use(
  cors({
    // origin: function (origin, callback) {
    //   if (whitelist.indexOf(origin as string) !== -1) {
    //     callback(null, true); // cors 허용
    //   } else {
    //     callback(new Error("Not Allowed Origin!")); // cors 비허용
    //   }
    // },
  })
);

app.use("/", async (req: Request, res: Response, next: NextFunction) => {
  await dbConnect();
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Ts express");
});

app.use("/user", user);
app.use("/vote", vote);

app.listen(port, async () => {
  await dbConnect();
  console.log("hello world");
});

//mongodb
