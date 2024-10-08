import { NextFunction, Request, Response, Router } from "express";
import StaticService from "../services/staticService";

class StaticController {
  public router: Router;
  private staticServiceInstance: StaticService;

  constructor() {
    this.router = Router();
    this.staticServiceInstance = new StaticService();
    this.initializeRoutes();
  }

  public setSquareServiceInstance(instance: StaticService) {
    this.staticServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createStaticServiceInstance.bind(this));
    this.router.use("/", this.roleCheck.bind(this));
    this.router.get("/sameLoc", this.getUserStaticSameLocation.bind(this));
  }

  private async createStaticServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const staticServiceInstance = new StaticService(decodedToken);
    this.setSquareServiceInstance(staticServiceInstance);
    next();
  }

  private async roleCheck(req: Request, res: Response, next: NextFunction) {
    const isAvailable = await this.staticServiceInstance.roleCheck();
    if (isAvailable) next();
    else throw new Error();
  }

  private async getUserStaticSameLocation(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { date } = req.query;

      const result = await this.staticServiceInstance.getUserInSameLocation(
        date as string,
      );

      return res.status(200).json(result);
    } catch {
      next();
    }
  }
}

const staticController = new StaticController();
module.exports = staticController.router;
