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
      const { month } = req.query;
      const monthNum = Number(month);

      await this.staticServiceInstance.getUserInSameLocation(monthNum);

      return res.status(200).end();
    } catch {
      next();
    }
  }
}

const staticController = new StaticController();
module.exports = staticController.router;
