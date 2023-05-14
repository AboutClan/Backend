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
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();
  });

router
  .route("/:date/status/confirm")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();
  });

router
  .route("/:date/status/waitingConfirm")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminVoteServiceInstance } = req;
    if (!adminVoteServiceInstance) throw new Error();
  });

module.exports = router;
