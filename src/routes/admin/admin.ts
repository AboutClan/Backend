import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

const user = require("./user");
const vote = require("./vote");

router.use("/vote", vote);
router.use("/user", user);

module.exports = router;
