import { NextFunction, Request, Response, Router } from "express";
import FeedService from "../services/feedService";

class FeedController {
  public router: Router;
  public feedServiceInstance: FeedService;

  constructor() {
    this.router = Router();
    this.feedServiceInstance = new FeedService();
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
      .post(this.createFeed.bind(this));
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
    this.feedServiceInstance.findFeedById(id);
    return res.status(200).end();
  }

  private async createFeed(req: Request, res: Response, next: NextFunction) {
    const { title, text, imageUrl, writer, type } = req.body;

    this.feedServiceInstance.createFeed({
      title,
      text,
      imageUrl,
      writer,
      type,
    });

    return res.status(200).end();
  }
}

const feedController = new FeedController();
module.exports = feedController.router;
