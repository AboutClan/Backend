import { count } from "console";
import express, { NextFunction, Request, Response } from "express";
import CounterService from "../../services/counterService";
import CountcounterService from "../../services/dailyCheckService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;
  const counterService = new CounterService(decodedToken);
  req.counterServiceInstance = counterService;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const {
      counterServiceInstance,
      query: { key, location },
    } = req;
    try {
      const counter = await counterServiceInstance?.getCounter(
        key as string,
        location as string
      );
      res.status(200).json(counter);
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
      const data = await counterServiceInstance?.setCounter(key, location);
      return res.status(200).json(data);
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
