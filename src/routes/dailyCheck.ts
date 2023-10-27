import express, { NextFunction, Request, Response } from "express";
import DailyCheckService from "../services/dailyCheckService";
import NoticeService from "../services/noticeService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const dailyCheckService = new DailyCheckService(decodedToken);
  req.dailyCheckServiceInstance = dailyCheckService;
  next();
});

router
  .route("/")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      dailyCheckServiceInstance,
      body: { uid, name },
    } = req;

    try {
      await dailyCheckServiceInstance?.setDailyCheck(uid, name);
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
      const user = await dailyCheckServiceInstance?.getAllLog();
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
