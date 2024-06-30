import express, { NextFunction, Request, Response, Router } from "express";
import DailyCheckService from "../services/dailyCheckService";

class DailyCheckController {
  public router: Router;
  private dailyCheckServiceInstance: DailyCheckService;

  public setDailyCheckServiceInstance(instance: DailyCheckService) {
    this.dailyCheckServiceInstance = instance;
  }

  constructor() {
    this.router = Router();
    this.initializeRoutes();
    this.dailyCheckServiceInstance = new DailyCheckService();
  }

  private initializeRoutes() {
    this.router.use("/", this.createDailyCheckServiceInstance.bind(this));

    this.router.get("/", this.getLog.bind(this));
    this.router.post("/", this.setDailyCheck.bind(this));
    this.router.get("/all", this.getAllLog.bind(this));
  }

  private async createDailyCheckServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const dailyCheckService = new DailyCheckService(decodedToken);
    this.setDailyCheckServiceInstance(dailyCheckService);
    next();
  }

  private async getLog(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.dailyCheckServiceInstance?.getLog();
      res.status(200).json(users);
    } catch (err: any) {
      next(err);
    }
  }

  private async setDailyCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.dailyCheckServiceInstance?.setDailyCheck();
      if (result) return res.status(400).json({ message: result });
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async getAllLog(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.dailyCheckServiceInstance?.getAllLog();
      res.status(200).json(users);
    } catch (err: any) {
      next(err);
    }
  }
}

const dailyCheckController = new DailyCheckController();
module.exports = dailyCheckController.router;
