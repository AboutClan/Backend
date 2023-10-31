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
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionServiceInstance } = req;
    try {
      const user = await collectionServiceInstance?.getCollection();
      res.status(200).json(user);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      collectionServiceInstance,
      body: { alphabet },
    } = req;
    try {
      await collectionServiceInstance?.setCollection(alphabet);
      return res.end();
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/alphabet/completed")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      collectionServiceInstance,
      body: {},
    } = req;
    try {
      const result = await collectionServiceInstance?.setCollectionCompleted();
      if (result === "not completed") {
        res.status(400).json({ message: "not completed" });
      } else {
        return res.end();
      }
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/alphabet/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { collectionServiceInstance } = req;
    try {
      const user = await collectionServiceInstance?.getCollection();
      res.status(200).json(user);
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
