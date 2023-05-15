import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import { strToDate } from "../utils/dateUtils";
import { findOneVote } from "../utils/voteUtils";
import { IVoteStudyInfo } from "../types/vote";
import VoteService from "../services/voteService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token?.toString() == "undefined" || !token) return;

  const decodedToken = await decode({
    token,
    secret: "klajsdflksjdflkdvdssdq231e1w",
  });

  if (!decodedToken) {
    return res.status(401).send("Unauthorized");
  } else {
    const voteServiceInstance = new VoteService(decodedToken);
    req.voteServiceInstance = voteServiceInstance;
    req.token = decodedToken;
    next();
  }
});

router
  .route("/arrived")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");

    const { startDay, endDay } = req.query as {
      startDay: string;
      endDay: string;
    };

    const results = await voteServiceInstance.getArrivedPeriod(
      startDay,
      endDay
    );

    return res.status(200).json(results);
  });

router.use(
  "/:date",
  async (req: Request, res: Response, next: NextFunction) => {
    const { date: dateStr } = req.params;
    const dayjsDate = strToDate(dateStr);
    console.log(1, dayjsDate);
    const date = dayjsDate.toDate();
    console.log(2, date);

    req.date = date;
    next();
  }
);

router
  .route("/:date")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    let { location } = req.query as { location: string };
    if (!location || location.toString() == "undefined") location = "수원";
    const { date } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    if (!date) return res.status(400).send("no data");

    const filteredVote = await voteServiceInstance.getFilteredVote(
      date,
      location
    );

    return res.status(200).json(filteredVote);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { place, subPlace, start, end }: IVoteStudyInfo = req.body;

    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");

    const { date } = req;
    if (!date) return res.status(400).send("no data");

    const vote = await findOneVote(date);
    if (!vote) throw new Error();

    voteServiceInstance.setVote(date, { place, subPlace, start, end });
    return res.status(204).end();
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    const { start, end }: IVoteStudyInfo = req.body;

    voteServiceInstance.patchVote(date, start, end);
    return res.status(200).end();
  })
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    await voteServiceInstance.deleteVote(date);
    return res.status(204).end();
  });

//Todo: aggregate와 속도 비교
router
  .route("/:date/absence")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    const result = await voteServiceInstance.getAbsence(date);
    return res.status(200).json(result);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");
    const { message = "" } = req.body;

    const result = await voteServiceInstance.setAbsence(date, message);
    return res.status(200).json(result);
  });

router
  .route("/:date/arrived")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    const arriveInfo = await voteServiceInstance.getArrived(date);
    return res.status(200).json(arriveInfo);
  });

router
  .route("/:date/confirm")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    await voteServiceInstance.patchConfirm(date);
    return res.status(200).end();
  });

router
  .route("/:date/dismiss")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    voteServiceInstance.patchDismiss(date);
    return res.status(204).end();
  });

router
  .route("/:date/start")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;
    if (!voteServiceInstance) return res.status(401).send("Unauthorized");
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    const result = await voteServiceInstance.getStart(date);
    res.status(200).json(result);
  });

module.exports = router;
