import express, { NextFunction, Request, Response } from "express";
import PromotionService from "../services/promotionService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const promotionServiceInstance = new PromotionService(decodedToken);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  req.promotionServiceInstance = promotionServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { promotionServiceInstance } = req;

      const promotionData = await promotionServiceInstance?.getPromotion();
      return res.status(200).json(promotionData);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        promotionServiceInstance,
        body: { name },
      } = req;

      await promotionServiceInstance?.setPromotion(name);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
