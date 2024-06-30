import express, { NextFunction, Request, Response, Router } from "express";
import PlazaService from "../services/plazaService";
import validateCheck from "../middlewares/validator";
import { body } from "express-validator";

const router: Router = express.Router();
class PlazaController {
  public router: Router;
  private plazaServiceInstance: PlazaService;

  constructor() {
    this.router = Router();
    this.plazaServiceInstance = new PlazaService();
    this.initializeRoutes();
  }

  public setPlazaServiceInstance(instance: PlazaService) {
    this.plazaServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createPlazaServiceInstance.bind(this));
    this.router
      .route("/")
      .get(this.getPlaza.bind(this))
      .post(
        body("plaza").notEmpty().withMessage("plaza필요"),
        validateCheck,
        this.createPlaza.bind(this),
      );
  }

  private async createPlazaServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const plazaService = new PlazaService();
    this.setPlazaServiceInstance(plazaService);
    next();
  }

  private async getPlaza(req: Request, res: Response, next: NextFunction) {
    try {
      const plazaData = await this.plazaServiceInstance.getPlaza();
      res.status(200).json(plazaData);
    } catch (err: any) {
      next(err);
    }
  }

  private async createPlaza(req: Request, res: Response, next: NextFunction) {
    const {
      body: { plaza },
    } = req;

    try {
      await this.plazaServiceInstance?.createPlaza(plaza);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
}

const plazaController = new PlazaController();
module.exports = plazaController.router;
