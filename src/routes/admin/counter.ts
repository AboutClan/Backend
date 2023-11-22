import { count } from "console";
import express, { NextFunction, Request, Response } from "express";
import DailyCheckService from "../../services/dailyCheckService";

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
    const {
      counterServiceInstance,
      body: { key, location },
    } = req;
    try {
      const counter = await counterServiceInstance?.getCounter(key, location);
      res.status(200).json(10);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      counterServiceInstance,
      body: { key, location },
    } = req;
    try {
      await counterServiceInstance?.setCounter(key, location);
    } catch (err: any) {
      next(err);
    }
    return res.end().json("A");
  });

module.exports = router;
