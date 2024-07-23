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
      .post(this.upload.single("image"), this.createFeed.bind(this));
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
    const { id } = req.query as { id: string };
    if (id) {
      const feed = await this.feedServiceInstance.findFeedById(id);
      return res.status(200).json(feed);
    } else {
      const feeds = await this.feedServiceInstance.findAllFeeds();
      return res.status(200).json(feeds);
    }
  }

  private async createFeed(req: Request, res: Response, next: NextFunction) {
    const { title, text, writer, type } = req.body;
    let buffer = req.file?.buffer;

    try {
      await this.feedServiceInstance.createFeed({
        title,
        text,
        writer,
        type,
        buffer,
      });

      return res.status(200).json({ a: "success" });
    } catch (err: any) {
      next(err);
    }
  }
}

const feedController = new FeedController();
module.exports = feedController.router;
