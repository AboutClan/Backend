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
      const users = await collectionServiceInstance?.getCollection();
      res.status(200).json(users);
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
      const result = await collectionServiceInstance?.setCollection(alphabet);
      if (result === "completed") {
        res.status(200).json({ message: "completed" });
      } else {
        return res.end();
      }
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
