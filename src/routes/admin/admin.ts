import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

const user = require("./user");
const vote = require("./vote");
const log = require("./log");

router.use("/vote", vote);
router.use("/user", user);
router.use("/log", log);

module.exports = router;
