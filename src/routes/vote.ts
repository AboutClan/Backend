import express, { NextFunction, Request, Response } from "express";
import { strToDate } from "../utils/dateUtils";
import { IVoteStudyInfo } from "../types/vote";
import VoteService from "../services/voteService";
import { query, body, param } from "express-validator";
import validateCheck from "../middlewares/validator";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const voteServiceInstance = new VoteService(decodedToken);
  req.voteServiceInstance = voteServiceInstance;
  req.token = decodedToken;
  next();
});

router.route("/arrived").get(
  query("startDay").notEmpty().withMessage("startDay입력 필요."),
  query("endDay").notEmpty().withMessage("startDay입력 필요."),
  validateCheck,

  async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;

    const { startDay, endDay } = req.query as {
      startDay: string;
      endDay: string;
    };

    try {
      const results = await voteServiceInstance?.getArrivedPeriod(
        startDay,
        endDay
      );
      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }
);

router
  .route("/arriveCnt")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance } = req;

    try {
      const result = await voteServiceInstance?.getArriveCheckCnt();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

router.use(
  "/:date",
  async (req: Request, res: Response, next: NextFunction) => {
    const { date: dateStr } = req.params;
    const dayjsDate = strToDate(dateStr);
    const date = dayjsDate.toDate();

    if (!date) return res.status(401).end();

    req.date = date;
    next();
  }
);

router
  .route("/:date")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;
    let { location = "수원" } = req.query as { location: string };

    try {
      const filteredVote = await voteServiceInstance?.getFilteredVote(
        date,
        location
      );
      return res.status(200).json(filteredVote);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { place, subPlace, start, end, memo }: IVoteStudyInfo = req.body;
    const { voteServiceInstance, date } = req;

    try {
      voteServiceInstance?.setVote(date, { place, subPlace, start, end, memo });
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  })
  .patch(
    body("start").notEmpty().withMessage("start필요"),
    body("end").notEmpty().withMessage("end필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { voteServiceInstance, date } = req;
      const { start, end }: IVoteStudyInfo = req.body;

      try {
        voteServiceInstance?.patchVote(date, start, end);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  )
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;
    try {
      await voteServiceInstance?.deleteVote(date);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

//Todo: aggregate와 속도 비교
router
  .route("/:date/absence")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;
    try {
      const result = await voteServiceInstance?.getAbsence(date);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      voteServiceInstance,
      date,
      body: { message = "" },
    } = req;

    try {
      const result = await voteServiceInstance?.setAbsence(date, message);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/arrived")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;

    try {
      const arriveInfo = await voteServiceInstance?.getArrived(date);
      return res.status(200).json(arriveInfo);
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;
    const {
      body: { memo = "" },
    } = req;

    try {
      await voteServiceInstance?.patchArrive(date, memo);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  });


router
  .route("/:date/confirm")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;

    try {
      await voteServiceInstance?.patchConfirm(date);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/dismiss")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;

    try {
      voteServiceInstance?.patchDismiss(date);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/start")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;

    try {
      const result = await voteServiceInstance?.getStart(date);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/quick")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { voteServiceInstance, date } = req;

    const voteInfo: Omit<IVoteStudyInfo, "place" | "subPlace"> = req.body;

    try {
      await voteServiceInstance?.quickVote(date, voteInfo);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/free")
  .patch(
    body("placeId").notEmpty().withMessage("placeId 필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        voteServiceInstance,
        date,
        body: { placeId },
      } = req;

      try {
        await voteServiceInstance?.setFree(date, placeId);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

module.exports = router;
