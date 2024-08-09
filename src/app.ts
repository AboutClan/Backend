import dotenv from "dotenv";
dotenv.config();

require("newrelic");

import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config/config";
import dbConnect from "./db/conn";
import tokenValidator from "./middlewares/auth";
import { dbSet } from "./middlewares/dbSet";
import ErrorHandler from "./middlewares/ErrorHandler";
import "./schedule/schedule";
import bodyParser from "body-parser";

// 매월 1일 00:00:00에 실행되는 스케줄을 생성합니다.
//router
const user = require("./routes/user");
const vote = require("./routes/vote");
const request = require("./routes/request");
const place = require("./routes/place");
const book = require("./routes/book");
const gift = require("./routes/gift");
const log = require("./routes/log");
const gather = require("./routes/gather");
const square = require("./routes/square");
const register = require("./routes/register");
const image = require("./routes/image");
const admin = require("./routes/admin/admin");
const notice = require("./routes/notice");
const dailyCheck = require("./routes/dailyCheck");
const collection = require("./routes/collection");
const groupStudy = require("./routes/groupStudy");
const promotion = require("./routes/promotion");
const webpush = require("./routes/webpush");
const feed = require("./routes/feed");
const fcm = require("./routes/fcm");
const chat = require("./routes/chat");

//swagger
const swaggerUi = require("swagger-ui-express");
const openapiSpecification = require("../swagger/swaggerSpec");
const swaggerSpec = openapiSpecification;

class App {
  private app: express.Application;
  private port: number;

  constructor() {
    this.port = parseInt(config.server.port.toString());
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    // middleware 설정
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(dbSet);
    this.app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.use("/fcm", fcm);
    this.app.use(tokenValidator);
  }

  setupRoutes() {
    this.app.get("/", (req, res, next) => res.send("hello world"));
    // 라우터 설정
    this.app.use("/user", user);
    this.app.use("/register", register);
    this.app.use("/vote", vote);
    this.app.use("/request", request);
    this.app.use("/place", place);
    this.app.use("/book", book);
    this.app.use("/admin", admin);
    this.app.use("/gift", gift);
    this.app.use("/log", log);
    this.app.use("/gather", gather);
    this.app.use("/square", square);
    this.app.use("/notice", notice);
    this.app.use("/image", image);
    this.app.use("/dailyCheck", dailyCheck);
    this.app.use("/collection", collection);
    this.app.use("/groupStudy", groupStudy);
    this.app.use("/promotion", promotion);
    this.app.use("/webpush", webpush);
    this.app.use("/feed", feed);
    this.app.use("/chat", chat);
    this.app.use(ErrorHandler);
  }

  listen() {
    // 서버 실행
    this.app.listen(this.port, async () => {
      await dbConnect();
      console.log(`Server is listening on port ${this.port}`);
    });
  }
}

const app = new App();
app.listen();

export default app;
