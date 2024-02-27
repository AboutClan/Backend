import express, { NextFunction, Request, Response } from "express";
import DailyCheckService from "../services/dailyCheckService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const dailyCheckService = new DailyCheckService(decodedToken);
  req.dailyCheckServiceInstance = dailyCheckService;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { dailyCheckServiceInstance } = req;

    try {
      const users = await dailyCheckServiceInstance?.getLog();
      res.status(200).json(users);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      dailyCheckServiceInstance,
      body: {},
    } = req;

    try {
      const result = await dailyCheckServiceInstance?.setDailyCheck();
      return res.status(404).json(result);
    } catch (err: any) {
      next(err);
    }
    return res.end();
  });

router
  .route("/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { dailyCheckServiceInstance } = req;

    try {
      const users = await dailyCheckServiceInstance?.getAllLog();
      res.status(200).json(users);
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
