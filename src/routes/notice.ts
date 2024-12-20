import express, { NextFunction, Request, Response, Router } from "express";
import { JWT } from "next-auth/jwt";
import FcmService from "../services/fcmService";
import NoticeService from "../services/noticeService";
import WebPushService from "../services/webPushService";

const router = express.Router();

class NoticeController {
  public decodedToken: null | JWT;
  public router: Router;
  private noticeServiceInstance: NoticeService;
  private webPushServiceInstance: WebPushService;
  private fcmServiceInstance: FcmService;

  constructor() {
    this.router = Router();
    this.noticeServiceInstance = new NoticeService();
    this.webPushServiceInstance = new WebPushService();
    this.fcmServiceInstance = new FcmService();
    this.decodedToken = null;
    this.initializeRoutes();
  }

  public setNoticeServiceInstance(instance: NoticeService) {
    this.noticeServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createNoticeServiceInstance.bind(this));

    this.router.route("/").get(this.getActiveLog.bind(this));
    this.router
      .route("/like")
      .get(this.getLike.bind(this))
      .post(this.setLike.bind(this))
      .delete(this.deleteLike.bind(this));
    this.router.route("/like/all").get(this.getLikeAll.bind(this));
    this.router
      .route("/friend")
      .get(this.getFriendRequest.bind(this))
      .post(this.requestFriendNotice.bind(this))
      .patch(this.updateRequestFriend.bind(this));
    this.router
      .route("/alphabet")
      .post(this.requestAlphabetNotice.bind(this))
      .patch(this.updateRequestAlphabet.bind(this));
  }

  private async createNoticeServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    this.decodedToken = decodedToken;
    const noticeService = new NoticeService(decodedToken);
    this.setNoticeServiceInstance(noticeService);
    next();
  }

  private async getActiveLog(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.noticeServiceInstance?.getActiveLog();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  }

  private async getLike(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.noticeServiceInstance?.getLike();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  }

  private async setLike(req: Request, res: Response, next: NextFunction) {
    const {
      body: { to, message },
    } = req;
    try {
      await this.noticeServiceInstance?.setLike(to, message);
      await this.webPushServiceInstance?.sendNotificationToX(
        to,
        "좋아요를 받았어요!",
        `${this.decodedToken?.name}님이 좋아요를 보냈어요!`,
      );

      // await this.fcmServiceInstance?.sendNotificationToX(
      //   to,
      //   "좋아요를 받았어요!",
      //   `${this.decodedToken?.name}님이 좋아요를 보냈어요!`,
      // );

      return res.end();
    } catch (err: any) {
      next(err);
    }
  }

  private async deleteLike(req: Request, res: Response, next: NextFunction) {
    const {
      body: { to, message },
    } = req;
    try {
      await this.noticeServiceInstance?.deleteLike(to);
      return res.end();
    } catch (err: any) {
      next(err);
    }
  }

  private async getLikeAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.noticeServiceInstance?.getLikeAll();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  }

  private async getFriendRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.noticeServiceInstance?.getFriendRequest();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  }

  private async requestFriendNotice(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { toUid, message },
    } = req;
    try {
      await this.noticeServiceInstance?.requestNotice("friend", toUid, message);
      await this.webPushServiceInstance?.sendNotificationToX(
        toUid,
        "친구요청을 받았어요!",
        `${this.decodedToken?.name}님이 친구요청을 보냈어요!`,
      );
      await this.fcmServiceInstance?.sendNotificationToX(
        toUid,
        "친구요청을 받았어요!",
        `${this.decodedToken?.name}님이 친구요청을 보냈어요!`,
      );
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async updateRequestFriend(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { from, status },
    } = req;
    try {
      const data = await this.noticeServiceInstance?.updateRequestFriend(
        "friend",
        from,
        status,
      );
      if (data === "no data") {
        return res.status(404).json({ message: "no data found" });
      }
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async requestAlphabetNotice(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { toUid, message, sub },
    } = req;
    try {
      await this.noticeServiceInstance?.requestNotice(
        "alphabet",
        toUid,
        message,
        sub,
      );
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async updateRequestAlphabet(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { from, status },
    } = req;
    try {
      const data = await this.noticeServiceInstance?.updateRequestFriend(
        "alphabet",
        from,
        status,
      );
      if (data === "no data") {
        return res.status(404).json({ message: "no data found" });
      }
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
}

const noticeController = new NoticeController();
module.exports = noticeController.router;
