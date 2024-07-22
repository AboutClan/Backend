import { NextFunction, Request, Response, Router } from "express";
import FeedService from "../services/feedService";
import FcmService from "../services/fcmService";
const multer = require("multer");

class FcmController {
  public router: Router;
  public fcmServiceInstance?: FcmService;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  public setFcmServiceInstance(instance: FcmService) {
    this.fcmServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createFcmServiceInstance.bind(this));
    this.router.get("/test", this.test.bind(this));
    this.router.post("/send-notification", this.sendNotification.bind(this));
    this.router
      .route("/token")
      .post(this.registerToken.bind(this))
      .delete(this.deleteToken.bind(this));
    this.router.route("/register-token").post(this.registerToken.bind(this));
  }

  private async createFcmServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const fcmServiceInstance = new FcmService(decodedToken);
    this.setFcmServiceInstance(fcmServiceInstance);
    next();
  }

  private async sendNotification(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { token, message } = req.body;

    try {
      const response = await this.fcmServiceInstance?.sendNotification(
        token,
        message,
      );
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async registerToken(req: Request, res: Response, next: NextFunction) {
    const { uid, fcmToken, platform } = req.body;

    try {
      const registered = this.fcmServiceInstance?.registerToken(
        uid,
        fcmToken,
        platform,
      );
      return res.status(200).json(registered);
    } catch (err: any) {
      next(err);
    }
  }

  private async deleteToken(req: Request, res: Response, next: NextFunction) {
    const { uid, platform } = req.body;

    try {
      const deleted = this.fcmServiceInstance?.deleteToken(uid, platform);
      return res.status(200).json(deleted);
    } catch (err: any) {
      next(err);
    }
  }

  private async test() {
    this.fcmServiceInstance?.sendNotificationToX(
      "2283035576",
      "hello",
      "hello",
    );
  }
}

const feedController = new FcmController();
module.exports = feedController.router;
