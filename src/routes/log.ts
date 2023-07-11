import express, { NextFunction, Request, Response } from "express";
import LogService from "../services/logService";
import { decode } from "next-auth/jwt";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const logServiceInstance = new LogService(decodedToken);
  req.logServiceInstance = logServiceInstance;
  next();
});

router.route("/score").get(async (req, res, next) => {
  const { logServiceInstance } = req;

  try {
    const logs = await logServiceInstance?.getLog("score");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/score/all").get(async (req, res, next) => {
  const { logServiceInstance } = req;

  try {
    const logs = await logServiceInstance?.getAllLog("score");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/point").get(async (req, res, next) => {
  const { logServiceInstance } = req;

  try {
    const logs = await logServiceInstance?.getLog("point");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/point/all").get(async (req, res, next) => {
  const { logServiceInstance } = req;

  try {
    const logs = await logServiceInstance?.getAllLog("point");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/deposit").get(async (req, res, next) => {
  const { logServiceInstance } = req;

  try {
    const logs = await logServiceInstance?.getLog("deposit");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/deposit/all").get(async (req, res, next) => {
  const { logServiceInstance } = req;

  try {
    const logs = await logServiceInstance?.getAllLog("deposit");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

module.exports = router;
