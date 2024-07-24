import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import SquareService from "../services/squareService";

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
      .put(this.putPoll.bind(this))
      .get(this.canPoll.bind(this));
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
    try {
      const squareList = await this.SquareServiceInstance.getSquareList();
      res.status(200).json(squareList);
    } catch (err) {
      next(err);
    }
  }

  private async createSquare(req: Request, res: Response, next: NextFunction) {
    const {
      body: { square },
    } = req;

    try {
      await this.SquareServiceInstance?.createSquare(square);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteSquare(req: Request, res: Response, next: NextFunction) {
    const {
      body: { id: squareId },
    } = req;

    try {
      await this.SquareServiceInstance?.deleteSquare();
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async getSquare(req, res, next) {}

  private async getSquareComments(req, res, next) {}

  private async createSquareComment(req, res, next) {}

  private async deleteSquareComment(req, res, next) {}

  private async putPoll(req, res, next) {}

  private async canPoll(req, res, next) {}
}

const squareController = new SquareController();
module.exports = squareController.router;
