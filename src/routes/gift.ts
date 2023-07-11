import express, { NextFunction, Request, Response } from "express";
import GiftService from "../services/giftService";
import validateCheck from "../middlewares/validator";
import { body } from "express-validator";
const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const giftService = new GiftService(decodedToken);
  req.giftServiceInstance = giftService;
  next();
});

router.route("/").post(
  body("name").isEmpty().withMessage("name필요"),
  body("cnt").isEmpty().isNumeric().withMessage("cnt필요"),
  body("giftId").isEmpty().isNumeric().withMessage("giftId필요"),
  validateCheck,

  async (req: Request, res: Response, next: NextFunction) => {
    const {
      giftServiceInstance,
      body: { name, cnt, giftId },
    } = req;

    try {
      const user = await giftServiceInstance?.setGift(name, cnt, giftId);
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  }
);

router
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const {
      giftServiceInstance,
      params: { id },
    } = req;

    try {
      const user = await giftServiceInstance?.getGift(parseInt(id));
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { giftServiceInstance } = req;

    try {
      const user = await giftServiceInstance?.getAllGift();
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
