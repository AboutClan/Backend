import { NextFunction, Request, Response, Router } from "express";
import { body, param } from "express-validator";
import validateCheck from "../middlewares/validator";
import SquareService from "../services/squareService";
import { SecretSquareCategory } from "../db/models/secretSquare";
import multer from "multer";

class SquareController {
  public router: Router;
  private SquareServiceInstance: SquareService;
  private upload: multer.Multer;

  constructor() {
    this.router = Router();
    this.SquareServiceInstance = new SquareService();
    this.upload = multer({ storage: multer.memoryStorage() });
    this.initializeRoutes();
  }

  public setSquareServiceInstance(instance: SquareService) {
    this.SquareServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createSquareServiceInstance.bind(this));

    this.router
      .route("/")
      .get(this.getSquareList.bind(this))
      .post(
        this.upload.array("images", 5),
        body("title", "title is empty")
          .trim()
          .notEmpty()
          .isLength({ min: 3 })
          .withMessage("min length is 3"),
        body("content", "content is empty")
          .trim()
          .notEmpty()
          .isLength({ min: 10 })
          .withMessage("min length is 10"),
        body("type").isIn(["poll", "general"]),
        body(["category", "author"], "category or author are empty").notEmpty(),
        body("pollItems")
          .optional()
          .customSanitizer((pollItems) => JSON.parse(pollItems)),
        body("canMultiple").optional().toBoolean(),
        validateCheck,
        this.createSquare.bind(this),
      );

    this.router
      .route("/:squareId")
      .get(
        param("squareId").notEmpty(),
        validateCheck,
        this.getSquare.bind(this),
      ) // have problem
      .delete(
        param("squareId").notEmpty(),
        validateCheck,
        this.deleteSquare.bind(this),
      );

    this.router
      .route("/:squareId/comment/")
      .post(
        param("squareId").notEmpty(),
        body("comment")
          .trim()
          .notEmpty()
          .isLength({ min: 1 })
          .withMessage("min length of comment is 1"),
        body("user").notEmpty().withMessage("user is empty"),
        validateCheck,
        this.createSquareComment.bind(this),
      );

    this.router
      .route("/:squareId/comment/:commentId")
      .delete(
        param("squareId").notEmpty(),
        param("commentId").notEmpty(),
        validateCheck,
        this.deleteSquareComment.bind(this),
      );

    this.router
      .route("/:squareId/poll")
      .patch(
        param("squareId").notEmpty(),
        body("user").notEmpty().withMessage("user is empty"),
        body("pollItems").isArray({ min: 0 }),
        validateCheck,
        this.patchPoll.bind(this),
      )
      .get(
        param("squareId").notEmpty(),
        body("user").notEmpty().withMessage("user is empty"),
        validateCheck,
        this.getCurrentPollItems.bind(this),
      );

    this.router
      .route("/:squareId/like")
      .put(
        param("squareId").notEmpty(),
        body("user").notEmpty().withMessage("user is empty"),
        validateCheck,
        this.putLikeSquare.bind(this),
      )
      .delete(
        param("squareId").notEmpty(),
        body("user").notEmpty().withMessage("user is empty"),
        validateCheck,
        this.deleteLikeSquare.bind(this),
      );
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
    const {
      files,
      body: { category, title, content, type, pollItems, canMultiple, author },
    } = req;

    let buffers: Buffer[] = [];

    if (files && Array.isArray(files)) {
      buffers = files.map((file) => file.buffer);
    }

    try {
      await this.SquareServiceInstance.createSquare({
        category,
        title,
        content,
        type,
        poll: {
          pollItems,
          canMultiple,
        },
        author,
        buffers,
      });
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

  private async createSquareComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { squareId } = req.params;
    const { user, comment } = req.body;

    try {
      await this.SquareServiceInstance.createSquareComment({
        user,
        comment,
        squareId,
      });
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
    const { squareId, commentId } = req.params;
    try {
      await this.SquareServiceInstance.deleteSquareComment({
        squareId,
        commentId,
      });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  private async patchPoll(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;
    const { user, pollItems = [] } = req.body;

    try {
      await this.SquareServiceInstance.patchPoll({ squareId, user, pollItems });
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
    const { user } = req.body;

    try {
      const currentPollItems =
        await this.SquareServiceInstance.getCurrentPollItems({
          squareId,
          user,
        });
      res.status(200).json({ pollItems: currentPollItems });
    } catch (err) {
      next(err);
    }
  }

  private async putLikeSquare(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;
    const { user } = req.body;

    try {
      await this.SquareServiceInstance.putLikeSquare({ squareId, user });
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
    const { user } = req.body;

    try {
      await this.SquareServiceInstance.deleteLikeSquare({ squareId, user });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

const squareController = new SquareController();
module.exports = squareController.router;
