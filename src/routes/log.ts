import express, { NextFunction, Request, Response, Router } from "express";
import LogService from "../services/logService";
import { decode } from "next-auth/jwt";

class LogController {
  public router: Router;
  private logServiceInstance: LogService;

  constructor() {
    this.router = Router();
    this.logServiceInstance = new LogService();
    this.initializeRoutes();
  }

  public setLogServiceInstance(instance: LogService) {
    this.logServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createLogServiceInstance.bind(this));

    this.router.get("/score", this.getScoreLog.bind(this));
    this.router.get("/monthScore", this.getMonthScoreLog.bind(this));
    this.router.get("/score/all", this.getAllScoreLog.bind(this));
    this.router.get("/point", this.getPointLog.bind(this));
    this.router.get("/point/all", this.getAllPointLog.bind(this));
    this.router.get("/deposit", this.getDepositLog.bind(this));
    this.router.get("/deposit/all", this.getAllDepositLog.bind(this));
  }

  private async createLogServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const collectionService = new LogService(decodedToken);
    this.setLogServiceInstance(collectionService);
    next();
  }

  private async getScoreLog(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await this.logServiceInstance?.getLog("score");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  }

  private async getMonthScoreLog(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const logs = await this.logServiceInstance?.getMonthScoreLog();
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  }

  private async getAllScoreLog(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const logs = await this.logServiceInstance?.getAllLog("score");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  }

  private async getPointLog(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await this.logServiceInstance?.getLog("point");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  }

  private async getAllPointLog(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const logs = await this.logServiceInstance?.getAllLog("point");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  }

  private async getDepositLog(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await this.logServiceInstance?.getLog("deposit");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  }

  private async getAllDepositLog(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const logs = await this.logServiceInstance?.getAllLog("deposit");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  }
}

const logController = new LogController();
module.exports = logController.router;
