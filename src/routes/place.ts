import express, { NextFunction, Request, Response, Router } from "express";
import PlaceService from "../services/placeService";

class PlaceController {
  public router: Router;
  private placeServiceInstance: PlaceService;

  constructor() {
    this.router = Router();
    this.placeServiceInstance = new PlaceService();
    this.initializeRoutes();
  }

  public setPlaceServiceInstance(instance: PlaceService) {
    this.placeServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createPlaceServiceInstance.bind(this));

    this.router.use("/", this.createPlaceServiceInstance.bind(this));
    this.router
      .route("/")
      .get(this.getActivePlace.bind(this))
      .post(this.addPlace.bind(this));
    this.router.route("/status").post(this.updateStatus.bind(this));
  }

  private async createPlaceServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const placeService = new PlaceService(decodedToken);
    this.setPlaceServiceInstance(placeService);
    next();
  }

  private async getActivePlace(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const status: "active" | "inactive" =
      (req.query?.status as "active" | "inactive") || "active";

    try {
      const places = await this.placeServiceInstance?.getActivePlace(status);
      return res.status(200).json(places);
    } catch (err: any) {
      next(err);
    }
  }

  private async addPlace(req: Request, res: Response, next: NextFunction) {
    const placeInfo = req.body;

    try {
      const places = await this.placeServiceInstance?.addPlace(placeInfo);
      return res.status(200).json(places);
    } catch (err: any) {
      next(err);
    }
  }

  private async updateStatus(req: Request, res: Response, next: NextFunction) {
    const { placeId, status } = req.body;

    try {
      const places = await this.placeServiceInstance?.updateStatus(
        placeId,
        status,
      );
      return res.status(200).json(places);
    } catch (err: any) {
      next(err);
    }
  }
}

const placeController = new PlaceController();
module.exports = placeController.router;
