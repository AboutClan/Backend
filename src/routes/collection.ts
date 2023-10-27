import express, { NextFunction, Request, Response } from "express";

import CollectionService from "../services/collectionService";
import NoticeService from "../services/noticeService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const collectionService = new CollectionService(decodedToken);
  req.collectionServiceInstance = collectionService;
  next();
});

router
  .route("/alphabet")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      collectionServiceInstance,
      body: { alphabet },
    } = req;

    try {
      await collectionServiceInstance?.setCollection(alphabet);
    } catch (err: any) {
      next(err);
    }
    return res.end();
  });

router
  .route("/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionServiceInstance } = req;

    try {
      const users = await collectionServiceInstance?.getAllLog();
      res.status(200).json(users);
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
