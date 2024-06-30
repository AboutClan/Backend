import express, { NextFunction, Request, Response, Router } from "express";
import GiftService from "../services/giftService";
import validateCheck from "../middlewares/validator";
import { body } from "express-validator";

class GiftController {
  public router: Router;
  private giftServiceInstance: GiftService;

  constructor() {
    this.router = Router();
    this.giftServiceInstance = new GiftService();
    this.initializeRoutes();
  }

  public setGiftServiceInstance(instance: GiftService) {
    this.giftServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createGiftServiceInstance.bind(this));

    this.router
      .route("/")
      .post(
        body("name").notEmpty().withMessage("name필요"),
        body("cnt").notEmpty().isNumeric().withMessage("cnt필요"),
        body("giftId").notEmpty().isNumeric().withMessage("giftId필요"),
        validateCheck,
        this.setGift.bind(this),
      );

    this.router.route("/all").get(this.getAllGift.bind(this));
    this.router.route("/:id").get(this.getGift.bind(this));
  }

  private async createGiftServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const giftService = new GiftService(decodedToken);
    this.setGiftServiceInstance(giftService);
    next();
  }

  private async setGift(req: Request, res: Response, next: NextFunction) {
    const {
      body: { name, cnt, giftId },
    } = req;

    try {
      const user = await this.giftServiceInstance?.setGift(name, cnt, giftId);
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  }

  private async getGift(req: Request, res: Response, next: NextFunction) {
    const {
      params: { id },
    } = req;

    try {
      const user = await this.giftServiceInstance?.getGift(parseInt(id));
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  }

  private async getAllGift(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.giftServiceInstance?.getAllGift();
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  }
}

const giftController = new GiftController();
module.exports = giftController.router;
