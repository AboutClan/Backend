import { NextFunction, Request, Response, Router } from "express";
import FeedService from "../services/feedService";
const multer = require("multer");

class FeedController {
  public router: Router;
  public feedServiceInstance: FeedService;
  private upload: any;

  constructor() {
    this.router = Router();
    this.feedServiceInstance = new FeedService();
    this.upload = multer({ storage: multer.memoryStorage() });
    this.initializeRoutes();
  }

  public setFeedServiceInstance(instance: FeedService) {
    this.feedServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createFeedServiceInstance.bind(this));

    this.router
      .route("/")
      .get(this.getFeed.bind(this))
      .post(this.upload.array("images", 5), this.createFeed.bind(this));

    this.router
      .route("/like")
      .get(this.getLike.bind(this))
      .post(this.createLike.bind(this));

    this.router
      .route("/comment")
      .post(this.createComment.bind(this))
      .delete(this.deleteComment.bind(this))
      .patch(this.updateComment.bind(this));
  }

  private async createLike(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;

      await this.feedServiceInstance.toggleLike(id);

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { feedId, commentId, comment } = req.body;

      await this.feedServiceInstance.updateComment(feedId, commentId, comment);

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { feedId, comment } = req.body;

      await this.feedServiceInstance.createComment(feedId, comment);

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { feedId, commentId } = req.body;

      await this.feedServiceInstance.deleteComment(feedId, commentId);

      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

  private async createFeedServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const feedServiceInstance = new FeedService(decodedToken);
    this.setFeedServiceInstance(feedServiceInstance);
    next();
  }

  private async getFeed(req: Request, res: Response, next: NextFunction) {
    const { id, type, typeId, cursor, isRecent } = req.query as {
      id?: string;
      typeId?: string;
      cursor?: string;
      type?: string;
      isRecent?: string;
    };

    const cursorNum = cursor ? parseInt(cursor) : null;

    if (id) {
      const feed = await this.feedServiceInstance.findFeedById(id);
      return res.status(200).json(feed);
    } else if (type) {
      const feed = await this.feedServiceInstance.findFeedByType(
        type,
        typeId,
        cursorNum,
        isRecent === "true",
      );
      return res.status(200).json(feed);
    } else {
      const feeds = await this.feedServiceInstance.findAllFeeds(
        cursorNum,
        isRecent === "true",
      );
      return res.status(200).json(feeds);
    }
  }

  private async getLike(req: Request, res: Response, next: NextFunction) {
    const { id } = req.query as {
      id: string;
    };
    const feed = await this.feedServiceInstance.findFeedLikeById(id);
    return res.status(200).json(feed);
  }

  private async createFeed(req: Request, res: Response, next: NextFunction) {
    const { title, text, type, typeId, isAnonymous, subCategory } = req.body;
    let buffers: Buffer[] = [];

    if (req.files && Array.isArray(req.files)) {
      buffers = req.files.map((file: Express.Multer.File) => file.buffer);
    }

    try {
      await this.feedServiceInstance.createFeed({
        title,
        text,
        type,
        buffers,
        typeId,
        isAnonymous,
        subCategory,
      });

      return res.status(200).json({ a: "success" });
    } catch (err: any) {
      next(err);
    }
  }
}

const feedController = new FeedController();
module.exports = feedController.router;
