import express, { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import GroupStudyService from "../services/groupStudyService";

const router: Router = express.Router();

class GroupStudyController {
  public router: Router;
  private groupStudyServiceInstance: GroupStudyService;

  constructor() {
    this.router = Router();
    this.groupStudyServiceInstance = new GroupStudyService();
    this.initializeRoutes();
  }

  public setGroupStudyServiceInstance(instance: GroupStudyService) {
    this.groupStudyServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createGroupStudyServiceInstance.bind(this));

    this.router
      .route("/")
      .get(this.getGroupStudy.bind(this))
      .post(
        body("groupStudy").notEmpty().withMessage("groupStudy필요"),
        validateCheck,
        this.createGroupStudy.bind(this),
      )
      .patch(
        body("groupStudy").notEmpty().withMessage("groupStudy필요"),
        validateCheck,
        this.updateGroupStudy.bind(this),
      );

    this.router
      .route("/participate")
      .post(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        validateCheck,
        this.participateGroupStudy.bind(this),
      )
      .delete(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        validateCheck,
        this.deleteParticipate.bind(this),
      );

    this.router
      .route("/participate/exile")
      .delete(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        validateCheck,
        this.exileParticipate.bind(this),
      );

    this.router
      .route("/waiting")
      .post(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        validateCheck,
        this.setWaitingPerson.bind(this),
      );

    this.router
      .route("/waiting/status")
      .post(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        validateCheck,
        this.agreeWaitingPerson.bind(this),
      );

    this.router.route("/waiting/:id").get(this.getWaitingPerson.bind(this));

    this.router
      .route("/attendance/:id")
      .get(this.getAttendanceGroupStudy.bind(this));

    this.router
      .route("/attendance")
      .patch(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        validateCheck,
        this.attendGroupStudy.bind(this),
      );

    this.router
      .route("/attendance/confirm")
      .patch(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        validateCheck,
        this.patchAttendanceWeek.bind(this),
      );

    this.router
      .route("/comment")
      .post(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        body("comment").notEmpty().isString().withMessage("comment필요"),
        validateCheck,
        this.createComment.bind(this),
      )
      .delete(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        body("commentId").notEmpty().withMessage("commentId필요"),
        validateCheck,
        this.deleteComment.bind(this),
      )
      .patch(
        body("id").notEmpty().isNumeric().withMessage("id필요"),
        body("comment").notEmpty().isString().withMessage("string필요"),
        body("commentId").notEmpty().withMessage("commentId필요"),
        validateCheck,
        this.patchComment.bind(this),
      );

    this.router
      .route("/belong/match")
      .patch(validateCheck, this.belongToParticipateGroupStudy.bind(this));
  }

  private async createGroupStudyServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const groupStudyService = new GroupStudyService(decodedToken);
    this.setGroupStudyServiceInstance(groupStudyService);
    next();
  }

  private async getGroupStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupStudyId, filter } = req.query as {
        groupStudyId?: string;
        filter?: string;
      };

      let groupStudyData;

      if (groupStudyId) {
        groupStudyData =
          await this.groupStudyServiceInstance.getGroupStudyById(groupStudyId);
        return res.status(200).json(groupStudyData);
      } else {
        if (filter) {
          groupStudyData =
            await this.groupStudyServiceInstance.getGroupStudyByFilter(filter);
        } else {
          groupStudyData = await this.groupStudyServiceInstance.getGroupStudy();
        }
      }

      return res.status(200).json(groupStudyData);
    } catch (err) {
      next(err);
    }
  }

  private async createGroupStudy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { groupStudy },
    } = req;

    try {
      const groupStudyId =
        await this.groupStudyServiceInstance.createGroupStudy(groupStudy);
      res.status(200).json({ groupStudyId });
    } catch (err) {
      next(err);
    }
  }

  private async updateGroupStudy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { groupStudy },
    } = req;

    try {
      await this.groupStudyServiceInstance.updateGroupStudy(groupStudy);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async participateGroupStudy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { id },
    } = req;

    try {
      await this.groupStudyServiceInstance.participateGroupStudy(id);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteParticipate(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { id },
    } = req;

    try {
      await this.groupStudyServiceInstance.deleteParticipate(id);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async exileParticipate(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { id, toUid, randomId },
    } = req;

    try {
      await this.groupStudyServiceInstance.exileParticipate(
        id,
        toUid,
        randomId,
      );
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async setWaitingPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { id, answer, pointType },
    } = req;

    try {
      await this.groupStudyServiceInstance.setWaitingPerson(
        id,
        pointType,
        answer,
      );
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async agreeWaitingPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { id, status, userId },
    } = req;

    try {
      await this.groupStudyServiceInstance.agreeWaitingPerson(
        id,
        userId,
        status,
      );
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async getWaitingPerson(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      params: { id },
    } = req;

    try {
      const result = await this.groupStudyServiceInstance.getWaitingPerson(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  private async getAttendanceGroupStudy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      params: { id },
    } = req;

    try {
      const result =
        await this.groupStudyServiceInstance.getAttendanceGroupStudy(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  private async attendGroupStudy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { id, weekRecord, type, weekRecordSub },
    } = req;

    try {
      const result = await this.groupStudyServiceInstance.attendGroupStudy(
        id,
        weekRecord,
        type,
        weekRecordSub,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  private async patchAttendanceWeek(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { id },
    } = req;

    try {
      const result =
        await this.groupStudyServiceInstance.patchAttendanceWeek(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  private async createComment(req: Request, res: Response, next: NextFunction) {
    const {
      body: { id, comment },
    } = req;

    try {
      await this.groupStudyServiceInstance.createComment(id, comment);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteComment(req: Request, res: Response, next: NextFunction) {
    const {
      body: { id, commentId },
    } = req;

    try {
      await this.groupStudyServiceInstance.deleteComment(id, commentId);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async patchComment(req: Request, res: Response, next: NextFunction) {
    const {
      body: { id, commentId, comment },
    } = req;

    try {
      await this.groupStudyServiceInstance.patchComment(id, commentId, comment);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async belongToParticipateGroupStudy(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result =
        await this.groupStudyServiceInstance.belongToParticipateGroupStudy();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

const groupStudyController = new GroupStudyController();
module.exports = groupStudyController.router;
