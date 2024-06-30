import express, { NextFunction, Request, Response, Router } from "express";
import { body, query } from "express-validator";
import validateCheck from "../middlewares/validator";
import VoteService from "../services/voteService";
import { IVoteStudyInfo } from "../types/vote";
import { strToDate } from "../utils/dateUtils";

const router = express.Router();

class VoteController {
  public router: Router;
  private voteServiceInstance: VoteService;

  constructor() {
    this.router = Router();
    this.voteServiceInstance = new VoteService();
    this.initializeRoutes();
  }

  public setVoteServiceInstance(instance: VoteService) {
    this.voteServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createVoteServiceInstance.bind(this));

    this.router
      .route("/arrived")
      .get(
        query("startDay").notEmpty().withMessage("startDay 입력 필요."),
        query("endDay").notEmpty().withMessage("startDay 입력 필요."),
        validateCheck,
        this.getArrivedPeriod.bind(this),
      );

    this.router
      .route("/participationCnt")
      .get(
        query("location").notEmpty().withMessage("location 입력 필요."),
        query("startDay").notEmpty().withMessage("startDay 입력 필요."),
        query("endDay").notEmpty().withMessage("endDay 입력 필요."),
        validateCheck,
        this.getParticipantsCnt.bind(this),
      );

    this.router.route("/deleteField").get(this.deleteField.bind(this));

    this.router.route("/arriveCnt").get(this.getArriveCheckCnt.bind(this));

    this.router.use("/:date", this.setDateParam.bind(this));

    this.router
      .route("/:date")
      .get(this.getFilteredVote.bind(this))
      .post(
        body("place").notEmpty().withMessage("place 입력 필요."),
        body("start").notEmpty().withMessage("start 입력 필요."),
        body("end").notEmpty().withMessage("end 입력 필요."),
        validateCheck,
        this.setVote.bind(this),
      )
      .patch(
        body("start").notEmpty().withMessage("start 입력 필요."),
        body("end").notEmpty().withMessage("end 입력 필요."),
        validateCheck,
        this.patchVote.bind(this),
      )
      .delete(this.deleteVote.bind(this));

    this.router.route("/:date/week").get(this.getFilteredVoteByDate.bind(this));

    this.router
      .route("/:date/absence")
      .get(this.getAbsence.bind(this))
      .post(
        body("message")
          .optional()
          .isString()
          .withMessage("message must be a string"),
        validateCheck,
        this.setAbsence.bind(this),
      );

    this.router
      .route("/:date/arrived")
      .get(this.getArrived.bind(this))
      .patch(
        body("memo").optional().isString().withMessage("memo must be a string"),
        validateCheck,
        this.patchArrive.bind(this),
      );

    this.router.route("/:date/confirm").patch(this.patchConfirm.bind(this));

    this.router.route("/:date/dismiss").patch(this.patchDismiss.bind(this));

    this.router.route("/:date/start").get(this.getStart.bind(this));

    this.router.route("/:date/quick").post(this.quickVote.bind(this));

    this.router
      .route("/:date/free")
      .patch(
        body("placeId").notEmpty().withMessage("placeId 필요"),
        validateCheck,
        this.setFree.bind(this),
      );
  }

  private async createVoteServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const voteService = new VoteService(decodedToken);
    this.setVoteServiceInstance(voteService);
    next();
  }

  private getArrivedPeriod = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { startDay, endDay } = req.query as {
      startDay: string;
      endDay: string;
    };

    try {
      const results = await this.voteServiceInstance?.getArrivedPeriod(
        startDay,
        endDay,
      );
      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };

  private getParticipantsCnt = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { location, startDay, endDay } = req.query as {
      location: string;
      startDay: string;
      endDay: string;
    };

    try {
      const results = await this.voteServiceInstance?.getParticipantsCnt(
        location,
        startDay,
        endDay,
      );
      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };

  private deleteField = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.voteServiceInstance?.deleteField();
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getArriveCheckCnt = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.voteServiceInstance?.getArriveCheckCnt();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  private setDateParam = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date: dateStr } = req.params;
    const dayjsDate = strToDate(dateStr);
    const date = dayjsDate.toDate();

    if (!date) return res.status(401).end();

    req.date = date;
    next();
  };

  private getFilteredVote = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;
    let { location = "수원" } = req.query as { location: string };

    try {
      const filteredVote = await this.voteServiceInstance?.getFilteredVote(
        date,
        location,
      );
      return res.status(200).json(filteredVote);
    } catch (err) {
      next(err);
    }
  };

  private setVote = async (req: Request, res: Response, next: NextFunction) => {
    const { place, subPlace, start, end, memo }: IVoteStudyInfo = req.body;
    const { date } = req;

    try {
      await this.voteServiceInstance?.setVote(date, {
        place,
        subPlace,
        start,
        end,
        memo,
      });
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  private patchVote = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { start, end }: IVoteStudyInfo = req.body;
    const { date } = req;

    try {
      await this.voteServiceInstance?.patchVote(date, start, end);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private deleteVote = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;

    try {
      await this.voteServiceInstance?.deleteVote(date);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  private getFilteredVoteByDate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;
    let { location = "수원" } = req.query as { location: string };

    try {
      const filteredVote =
        await this.voteServiceInstance?.getFilteredVoteByDate(date, location);
      return res.status(200).json(filteredVote);
    } catch (err) {
      next(err);
    }
  };

  private getAbsence = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;

    try {
      const result = await this.voteServiceInstance?.getAbsence(date);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  private setAbsence = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      date,
      body: { message = "" },
    } = req;

    try {
      const result = await this.voteServiceInstance?.setAbsence(date, message);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  private getArrived = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;

    try {
      const arriveInfo = await this.voteServiceInstance?.getArrived(date);
      return res.status(200).json(arriveInfo);
    } catch (err) {
      next(err);
    }
  };

  private patchArrive = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      date,
      body: { memo = "" },
    } = req;

    try {
      const result = await this.voteServiceInstance?.patchArrive(date, memo);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  private patchConfirm = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;

    try {
      await this.voteServiceInstance?.patchConfirm(date);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private patchDismiss = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;

    try {
      await this.voteServiceInstance?.patchDismiss(date);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  private getStart = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;

    try {
      const result = await this.voteServiceInstance?.getStart(date);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  private quickVote = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { date } = req;
    const voteInfo: Omit<IVoteStudyInfo, "place" | "subPlace"> = req.body;

    try {
      await this.voteServiceInstance?.quickVote(date, voteInfo);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private setFree = async (req: Request, res: Response, next: NextFunction) => {
    const {
      date,
      body: { placeId },
    } = req;

    try {
      await this.voteServiceInstance?.setFree(date, placeId);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };
}

const voteController = new VoteController();
module.exports = voteController.router;
