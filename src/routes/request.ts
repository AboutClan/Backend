import express, { NextFunction, Request, Response, Router } from "express";
import { decode } from "next-auth/jwt";
import RequestService from "../services/requestService";

const router: Router = express.Router();

class RequestController {
  public router: Router;
  private requestServiceInstance: RequestService;

  constructor() {
    this.router = Router();
    this.requestServiceInstance = new RequestService();
    this.initializeRoutes();
  }

  public setPromotionServiceInstance(instance: RequestService) {
    this.requestServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createRequestServiceInstance.bind(this));

    this.router
      .route("/")
      .get(this.getRequestData.bind(this))
      .post(this.createRequest.bind(this));
  }

  private async createRequestServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const requestService = new RequestService();
    this.setPromotionServiceInstance(requestService);
    next();
  }

  private async getRequestData(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const requestData = await this.requestServiceInstance.getRequest();
      res.status(200).json(requestData);
    } catch (err: any) {
      next(err);
    }
  }

  private async createRequest(req: Request, res: Response, next: NextFunction) {
    const {
      body: { request = "" },
    } = req;

    try {
      await this.requestServiceInstance?.createRequest(request);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
}

const requestController = new RequestController();
module.exports = requestController.router;
