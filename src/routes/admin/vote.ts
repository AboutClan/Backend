import express, { NextFunction, Request, Response } from "express";
import AdminVoteService from "../../services/adminVoteServices";

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
    if (!adminVoteServiceInstance) throw new Error();

    await adminVoteServiceInstance.deleteVote();

    res.status(200).end();
  });

router
  .route("/:date/status/confirm")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();

    const { date: dateStr } = req.params;

    await adminVoteServiceInstance.confirm(dateStr);

    res.status(200).end();
  });

router
  .route("/:date/status/waitingConfirm")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();

    const { date: dateStr } = req.params;

    await adminVoteServiceInstance.waitingConfirm(dateStr);

    res.status(200).end();
  });

module.exports = router;
