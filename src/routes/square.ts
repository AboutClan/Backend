import { NextFunction, Request, Response, Router } from "express";
import { body, param } from "express-validator";
import multer from "multer";
import { SecretSquareCategory } from "../db/models/secretSquare";
import validateCheck from "../middlewares/validator";
import SquareService from "../services/squareService";

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
          .isLength({ min: 1 })
          .withMessage("The min length of title field is 1"),
        body("content", "content is empty")
          .trim()
          .notEmpty()
          .isLength({ min: 1 })
          .withMessage("The min length of content field is 1"),
        body("type").isIn(["poll", "general"]),
        body("category", "category is empty").notEmpty(),
        body("pollItems")
          .optional()
          .customSanitizer((value) => JSON.parse(value)),
        body("canMultiple").optional().toBoolean(),
        validateCheck,
        this.createSquare.bind(this),
      );

    this.router
      .route("/comment")
      .post(
        body("comment")
          .trim()
          .notEmpty()
          .isLength({ min: 1 })
          .withMessage("min length of comment is 1"),
        validateCheck,
        this.createSquareComment.bind(this),
      )
      .delete(this.deleteSquareComment.bind(this));

    this.router
      .route("/subComment")
      .post(this.createSubComment.bind(this))
      .delete(this.deleteSubComment.bind(this));

    this.router
      .route("/:squareId")
      .get(
        param("squareId").notEmpty(),
        validateCheck,
        this.getSquare.bind(this),
      )
      .delete(
        param("squareId").notEmpty(),
        validateCheck,
        this.deleteSquare.bind(this),
      );

    this.router.route("/comment/like").post(this.createCommentLike.bind(this));

    this.router.route("/comment/like").post(this.createCommentLike.bind(this));
    this.router
      .route("/subComment/like")
      .post(this.createSubCommentLike.bind(this));

    // this.router
    //   .route("/:squareId/comment/:commentId")
    //   .delete(
    //     param("squareId").notEmpty(),
    //     param("commentId").notEmpty(),
    //     validateCheck,
    //     this.deleteSquareComment.bind(this),
    //   );

    this.router
      .route("/:squareId/poll")
      .patch(
        param("squareId").notEmpty(),
        body("pollItems").isArray({ min: 0 }),
        validateCheck,
        this.patchPoll.bind(this),
      )
      .get(
        param("squareId").notEmpty(),
        validateCheck,
        this.getCurrentPollItems.bind(this),
      );

    this.router
      .route("/:squareId/like")
      .get(param("squareId").notEmpty(), this.getIsLike.bind(this))
      .put(
        param("squareId").notEmpty(),
        validateCheck,
        this.putLikeSquare.bind(this),
      )
      .delete(
        param("squareId").notEmpty(),
        validateCheck,
        this.deleteLikeSquare.bind(this),
      );
  }

  private async createSquareServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const squareService = new SquareService(decodedToken);
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
      body: { category, title, content, type, pollItems, canMultiple },
    } = req;

    let buffers: Buffer[] = [];

    if (files && Array.isArray(files)) {
      buffers = files.map((file) => file.buffer);
    }

    try {
      const { squareId } = await this.SquareServiceInstance.createSquare({
        category,
        title,
        content,
        type,
        poll: {
          pollItems,
          canMultiple,
        },
        buffers,
      });
      res.status(201).json({ squareId });
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
    const { comment, squareId } = req.body;

    try {
      await this.SquareServiceInstance.createSquareComment({
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
    const { squareId, commentId } = req.body;

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

  // async patchComment(squareId: string, commentId: string, comment: string) {
  //   const gather = await Gather.findOne({ id: squareId });
  //   if (!gather) throw new Error();

  //   try {
  //     gather.comments.forEach(async (com: any) => {
  //       if ((com._id as string) == commentId) {
  //         com.comment = comment;
  //         await gather.save();
  //       }
  //     });
  //     return;
  //   } catch (err) {
  //     throw new Error();
  //   }
  // }

  private async updateSubComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { squareId, commentId, subCommentId, comment } = req.body;

      await this.SquareServiceInstance.updateSubComment(
        squareId,
        commentId,
        subCommentId,
        comment,
      );

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async createSubCommentLike(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { squareId, commentId, subCommentId } = req.body;

      await this.SquareServiceInstance?.createSubCommentLike(
        squareId,
        commentId,
        subCommentId,
      );

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async createCommentLike(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { squareId, commentId } = req.body;

      await this.SquareServiceInstance?.createCommentLike(squareId, commentId);

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
      const { squareId, comment, commentId } = req.body;

      await this.SquareServiceInstance.createSubComment(
        squareId,
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
      const { squareId, commentId, subCommentId } = req.body;

      await this.SquareServiceInstance.deleteSubComment(
        squareId,
        commentId,
        subCommentId,
      );

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async patchPoll(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;
    const { pollItems = [] } = req.body;

    try {
      await this.SquareServiceInstance.patchPoll({ squareId, pollItems });
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

    try {
      const currentPollItems =
        await this.SquareServiceInstance.getCurrentPollItems({
          squareId,
        });
      res.status(200).json({ pollItems: currentPollItems });
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

  private async getIsLike(req: Request, res: Response, next: NextFunction) {
    const { squareId } = req.params;

    try {
      const isLike = await this.SquareServiceInstance.getIsLike({ squareId });
      res.status(200).json({ isLike });
    } catch (err) {
      next(err);
    }
  }
}

const squareController = new SquareController();
module.exports = squareController.router;
