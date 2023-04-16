import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";

const app: Express = express();

//router
const user = require("./routes/user");
const vote = require("./routes/vote");

//port
const port = 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Ts express");
});

app.use("/user", user);
app.use("/vote", vote);

app.listen(port, () => {
  console.log("hello world");
});

//mongodb
