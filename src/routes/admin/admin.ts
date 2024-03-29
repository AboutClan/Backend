import express from "express";

const router = express.Router();

const user = require("./user");
const vote = require("./vote");
const log = require("./log");
const manage = require("./manage");
const counter = require("./counter");

router.use("/vote", vote);
router.use("/user", user);
router.use("/log", log);
router.use("/manage", manage);
router.use("/counter", counter);

module.exports = router;
