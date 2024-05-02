import express, { NextFunction, Request, Response } from "express";
import NoticeService from "../services/noticeService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const noticeService = new NoticeService(decodedToken);
  req.noticeServiceInstance = noticeService;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { noticeServiceInstance } = req;

    try {
      const result = await noticeServiceInstance?.getActiveLog();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/like")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { noticeServiceInstance } = req;

    try {
      const result = await noticeServiceInstance?.getLike();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      noticeServiceInstance,
      body: { to, message },
    } = req;

    try {
      await noticeServiceInstance?.setLike(to, message);
    } catch (err: any) {
      next(err);
    }

    return res.end();
  });

router
  .route("/like/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { noticeServiceInstance } = req;

    try {
      const result = await noticeServiceInstance?.getLikeAll();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/friend")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { noticeServiceInstance } = req;
    try {
      const result = await noticeServiceInstance?.getFriendRequest();
      return res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      noticeServiceInstance,
      body: { toUid, message },
    } = req;
    try {
      await noticeServiceInstance?.requestNotice("friend", toUid, message);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      noticeServiceInstance,
      body: { from, status },
    } = req;
    try {
      const data = await noticeServiceInstance?.updateRequestFriend(
        "friend",
        from,
        status,
      );
      if (data === "no data") {
        return res.status(404).json({ message: "no data found" });
      }
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/alphabet")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      noticeServiceInstance,
      body: { toUid, message, sub },
    } = req;
    try {
      await noticeServiceInstance?.requestNotice(
        "alphabet",
        toUid,
        message,
        sub,
      );
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      noticeServiceInstance,
      body: { from, status },
    } = req;
    try {
      const data = await noticeServiceInstance?.updateRequestFriend(
        "alphabet",
        from,
        status,
      );
      if (data === "no data") {
        return res.status(404).json({ message: "no data found" });
      }
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
