import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import SquareService from "../services/squareService";
import { SecretSquareCategory } from "../db/models/secretSquare";

class SquareController {
  public router: Router;
  private SquareServiceInstance: SquareService;

  constructor() {
    this.router = Router();
    this.SquareServiceInstance = new SquareService();
    this.initializeRoutes();
  }

  public setSquareServiceInstance(instance: SquareService) {
    this.SquareServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createSquareServiceInstance.bind(this));

    // TODO validation using express-validator
    this.router
      .route("/")
      .get(this.getSquareList.bind(this))
      .post(
        body("Square").notEmpty().withMessage("Square필요"),
        validateCheck,
        this.createSquare.bind(this),
      );

    this.router
      .route("/:squareId")
      .get(this.getSquare.bind(this))
      .delete(this.deleteSquare.bind(this));

    this.router
      .route("/:squareId/comments")
      .get(this.getSquareComments.bind(this));

    this.router.route("/comment").post(this.createSquareComment.bind(this));

    this.router
      .route("/comment/:commentId/")
      .delete(this.deleteSquareComment.bind(this));

    this.router
      .route("/:squareId/poll")
      .patch(this.patchPoll.bind(this))
      .get(this.getCurrentPollItems.bind(this));

    this.router
      .route("/:squareId/like")
      .put(this.putLikeSquare.bind(this))
      .delete(this.deleteLikeSquare.bind(this));
  }

  private async createSquareServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const squareService = new SquareService();
    this.setSquareServiceInstance(squareService);
    next();
  }

  private async getSquareList(req: Request, res: Response, next: NextFunction) {
    const { category = "all" } = req.query as {
      category?: SecretSquareCategory;
    };

    try {
      const squareList = await this.SquareServiceInstance.getSquareList({
        category,
      });
      res.status(200).json({ squareList });
    } catch (err) {
      next(err);
    }
  }

  private async createSquare(req: Request, res: Response, next: NextFunction) {
    const { square } = req.body;

    try {
      await this.SquareServiceInstance.createSquare(square);
      res.status(201).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteSquare(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;

    try {
      await this.SquareServiceInstance.deleteSquare(squareId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  private async getSquare(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;

    try {
      const square = await this.SquareServiceInstance.getSquare(squareId);
      res.status(200).json({ square });
    } catch (err) {
      next(err);
    }
  }

  private async getSquareComments(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { squareId } = req.params;

    try {
      const squareComments =
        await this.SquareServiceInstance.getSquareComments(squareId);
      res.status(200).json({ squareComments });
    } catch (err) {
      next(err);
    }
  }

  private async createSquareComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { body: comment } = req;
    try {
      await this.SquareServiceInstance.createSquareComment(comment);
      res.status(201).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteSquareComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { commentId } = req.params;
    try {
      await this.SquareServiceInstance.deleteSquareComment(commentId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  private async patchPoll(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;
    const { uid, pollItems = [] } = req.body;

    try {
      await this.SquareServiceInstance.patchPoll({ squareId, uid, pollItems });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  private async getCurrentPollItems(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { squareId } = req.params;
    const { uid } = req.body;

    try {
      const currentPollItems =
        await this.SquareServiceInstance.getCurrentPollItems({
          squareId,
          uid,
        });
      res.status(200).end({ pollItems: currentPollItems });
    } catch (err) {
      next(err);
    }
  }

  private async putLikeSquare(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;

    try {
      await this.SquareServiceInstance.putLikeSquare({ squareId });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteLikeSquare(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { squareId } = req.params;

    try {
      await this.SquareServiceInstance.deleteLikeSquare({ squareId });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

const squareController = new SquareController();
module.exports = squareController.router;
