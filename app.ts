import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Ts express");
});

app.listen(port, () => {
  console.log("hello world");
});
