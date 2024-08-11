import express, { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import GatherService from "../services/gatherService";

const router: Router = express.Router();

class GatherController {
  public router: Router;
  private gatherServiceInstance: GatherService;

  constructor() {
    this.router = Router();
    this.gatherServiceInstance = new GatherService();
    this.initializeRoutes();
  }

  public setGatherServiceInstance(instance: GatherService) {
    this.gatherServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createGatherServiceInstance.bind(this));

    this.router
      .route("/")
      .get(this.getGather.bind(this))
      .post(
        body("gather").notEmpty().withMessage("gather필요"),
        validateCheck,
        this.createGather.bind(this),
      )
      .delete(
        body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
        validateCheck,
        this.deleteGather.bind(this),
      )
      .patch(this.updateGather.bind(this));

    this.router
      .route("/participate")
      .post(
        body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
        validateCheck,
        this.participateGather.bind(this),
      )
      .delete(
        body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
        validateCheck,
        this.deleteParticipate.bind(this),
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
    this.router.route("/comment/like").post(this.createCommentLike.bind(this));
    this.router
      .route("/subComment")
      .post(this.createSubComment.bind(this))
      .delete(this.deleteSubComment.bind(this))
      .patch(this.updateSubComment.bind(this));

    this.router
      .route("/status")
      .patch(
        body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
        validateCheck,
        this.setStatus.bind(this),
      );
  }

  private async createGatherServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const gatherServiceInstance = new GatherService(decodedToken);
    this.setGatherServiceInstance(gatherServiceInstance);
    next();
  }

  private async getGather(req: Request, res: Response, next: NextFunction) {
    const { cursor, gatherId } = req.query as {
      cursor?: string;
      gatherId?: string;
    };
    const cursorNum = cursor ? parseInt(cursor) : null;
    const gatherIdNum = gatherId ? parseInt(gatherId) : null;

    let gatherData;
    try {
      if (gatherIdNum) {
        gatherData =
          await this.gatherServiceInstance.getGatherById(gatherIdNum);
      } else {
        if (cursorNum == -1) {
          gatherData = await this.gatherServiceInstance.getThreeGather();
        } else {
          gatherData = await this.gatherServiceInstance.getGather(cursorNum);
        }
      }
      res.status(200).json(gatherData);
    } catch (err: any) {
      next(err);
    }
  }

  private async createGather(req: Request, res: Response, next: NextFunction) {
    const {
      body: { gather },
    } = req;

    try {
      const gatherId = await this.gatherServiceInstance?.createGather(gather);
      res.status(200).json({ gatherId });
    } catch (err: any) {
      next(err);
    }
  }

  private async deleteGather(req: Request, res: Response, next: NextFunction) {
    const {
      body: { gatherId },
    } = req;

    try {
      const gatherData =
        await this.gatherServiceInstance?.deleteGather(gatherId);
      res.status(200).json(gatherData);
    } catch (err: any) {
      next(err);
    }
  }

  private async updateGather(req: Request, res: Response, next: NextFunction) {
    const {
      body: { gather },
    } = req;

    try {
      await this.gatherServiceInstance?.updateGather(gather);
      res.status(200).json();
    } catch (err: any) {
      next(err);
    }
  }

  private async participateGather(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { gatherId, phase, userId },
    } = req;

    try {
      await this.gatherServiceInstance?.participateGather(
        gatherId,
        phase,
        userId,
      );
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async deleteParticipate(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { gatherId },
    } = req;

    try {
      await this.gatherServiceInstance?.deleteParticipate(gatherId);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async createComment(req: Request, res: Response, next: NextFunction) {
    const {
      body: { id, comment },
    } = req;

    try {
      await this.gatherServiceInstance?.createComment(id, comment);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async deleteComment(req: Request, res: Response, next: NextFunction) {
    const {
      body: { id, commentId },
    } = req;

    try {
      await this.gatherServiceInstance?.deleteComment(id, commentId);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async patchComment(req: Request, res: Response, next: NextFunction) {
    const {
      body: { id, commentId, comment },
    } = req;

    try {
      await this.gatherServiceInstance?.patchComment(id, commentId, comment);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async createCommentLike(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gatherId, commentId } = req.body;

      await this.gatherServiceInstance?.createCommentLike(gatherId, commentId);

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async updateSubComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gatherId, commentId, subCommentId, comment } = req.body;

      await this.gatherServiceInstance.updateSubComment(
        gatherId,
        commentId,
        subCommentId,
        comment,
      );

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async createSubComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gatherId, comment, commentId } = req.body;

      await this.gatherServiceInstance.createSubComment(
        gatherId,
        commentId,
        comment,
      );

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteSubComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { gatherId, commentId, subCommentId } = req.body;

      await this.gatherServiceInstance.deleteSubComment(
        gatherId,
        commentId,
        subCommentId,
      );

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async setStatus(req: Request, res: Response, next: NextFunction) {
    const {
      body: { gatherId, status },
    } = req;

    try {
      await this.gatherServiceInstance?.setStatus(gatherId, status);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
}

const gatherController = new GatherController();
module.exports = gatherController.router;
