import express, { NextFunction, Request, Response } from "express";
import LogService from "../services/logService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const logServiceInstance = new LogService();
  req.logServiceInstance = logServiceInstance;
  next();
});

router.route("/score").get(async (req, res, next) => {
  const { logServiceInstance } = req;
  if (!logServiceInstance) throw new Error();

  const logs = await logServiceInstance.getLog("score");

  return res.status(200).json(logs);
});

router.route("/point").get(async (req, res, next) => {
  const { logServiceInstance } = req;
  if (!logServiceInstance) throw new Error();

  const logs = await logServiceInstance.getLog("point");
  return res.status(200).json(logs);
});

router.route("/deposit").get(async (req, res, next) => {
  const { logServiceInstance } = req;
  if (!logServiceInstance) throw new Error();

  const logs = await logServiceInstance.getLog("deposit");

  return res.status(200).json(logs);
});

module.exports = router;
