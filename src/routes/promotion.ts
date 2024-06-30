import express, { NextFunction, Request, Response, Router } from "express";
import PromotionService from "../services/promotionService";

const router = express.Router();

class PromotionController {
  public router: Router;
  private promotionServiceInstance: PromotionService;

  constructor() {
    this.router = Router();
    this.promotionServiceInstance = new PromotionService();
    this.initializeRoutes();
  }

  public setPromotionServiceInstance(instance: PromotionService) {
    this.promotionServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createPromotionServiceInstance.bind(this));

    this.router
      .route("/")
      .get(this.getPromotion.bind(this))
      .post(this.setPromotion.bind(this));
  }

  private async createPromotionServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const promotionService = new PromotionService(decodedToken);
    this.setPromotionServiceInstance(promotionService);
    next();
  }

  private async getPromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const promotionData = await this.promotionServiceInstance?.getPromotion();
      return res.status(200).json(promotionData);
    } catch (err) {
      next(err);
    }
  }

  private async setPromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { name },
      } = req;

      await this.promotionServiceInstance?.setPromotion(name);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
}

const promotionController = new PromotionController();
module.exports = promotionController.router;
