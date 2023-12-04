import dayjs from "dayjs";
import express, { NextFunction, Request, Response } from "express";
import AdminVoteService from "../../services/adminVoteServices";
import { strToDate } from "../../utils/dateUtils";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const adminVoteServiceInstance = new AdminVoteService();
  req.adminVoteServiceInstance = adminVoteServiceInstance;
  next();
});

router
  .route("/")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;

    await adminVoteServiceInstance?.deleteVote();

    res.status(200).end();
  });

router
  .route("/:date/status/confirm")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminVoteServiceInstance,
      params: { date: dateStr },
    } = req;

    await adminVoteServiceInstance?.confirm(dateStr);

    res.status(200).end();
  });

router
  .route("/:date/status/waitingConfirm")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminVoteServiceInstance,
      params: { date: dateStr },
    } = req;

    await adminVoteServiceInstance?.waitingConfirm(dateStr);

    res.status(200).end();
  });

router
  .route("/:date/reset")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminVoteServiceInstance,
      params: { date: dateStr },
    } = req;

    try {
      await adminVoteServiceInstance?.voteStatusReset(dateStr);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/studyRecord")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminVoteServiceInstance,
      query: { startDay, endDay, isAttend, location },
    } = req;
    return res.status(200).json(location);
    try {
      const result = await adminVoteServiceInstance?.getAdminStudyRecord(
        startDay as string,
        endDay as string,
        isAttend as string,
        location as string
      );
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
