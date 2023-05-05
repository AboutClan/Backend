const dotenv = require("dotenv");
dotenv.config();

import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import ErrorHandler from "./middlewares/ErrorHandler";
import helmet from "helmet";
import compression from "compression";

//router
const user = require("./routes/user");
const vote = require("./routes/vote");

class App {
  private app: express.Application;
  private port: number;

  constructor() {
    this.port = 3001;
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    // middleware 설정
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({}));
    this.app.use(helmet());
    this.app.use(compression());
  }

  setupRoutes() {
    // 라우터 설정
    this.app.use("/user", user);
    this.app.use("/vote", vote);

    this.app.use(ErrorHandler);
  }

  listen() {
    // 서버 실행
    this.app.listen(this.port, () => {
      console.log(`Server is listening on port ${this.port}`);
    });
  }
}

const app = new App();
app.listen();
