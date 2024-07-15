import express, { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import SquareService from "../services/SquareService";

const router: Router = express.Router();
class SquareController {
  public router: Router;
  private SquareServiceInstance: SquareService;

  constructor() {
    this.router = Router();
    this.SquareServiceInstance = new SquareService();
    this.initializeRoutes();
  }

  public setSquareServiceInstance(instance: SquareService) {
    this.SquareServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createSquareServiceInstance.bind(this));
    this.router
      .route("/")
      .get(this.getSquare.bind(this))
      .post(
        body("Square").notEmpty().withMessage("Square필요"),
        validateCheck,
        this.createSquare.bind(this),
      );
  }

  private async createSquareServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const squareService = new SquareService();
    this.setSquareServiceInstance(squareService);
    next();
  }

  private async getSquare(req: Request, res: Response, next: NextFunction) {
    try {
      const SquareData = await this.SquareServiceInstance.getSquare();
      res.status(200).json(SquareData);
    } catch (err: any) {
      next(err);
    }
  }

  private async createSquare(req: Request, res: Response, next: NextFunction) {
    const {
      body: { Square },
    } = req;

    try {
      await this.SquareServiceInstance?.createSquare(Square);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
}

const squareController = new SquareController();
module.exports = squareController.router;
