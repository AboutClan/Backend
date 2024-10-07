import { NextFunction, Request, Response, Router } from "express";

import CollectionService from "../services/collectionService";

class CollectionController {
  public router: Router;
  private collectionServiceInstance: CollectionService;

  constructor() {
    this.router = Router();
    this.collectionServiceInstance = new CollectionService();
    this.initializeRoutes();
  }

  public setCollectionServiceInstance(instance: CollectionService) {
    this.collectionServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createCollectionServiceInstance.bind(this));

    // 라우트 핸들러
    this.router.get("/alphabet", this.getCollection.bind(this));
    this.router.patch("/alphabet", this.setCollectionStamp.bind(this));
    this.router.patch("/alphabet/change", this.changeCollection.bind(this));
    this.router.post(
      "/alphabet/completed",
      this.setCollectionCompleted.bind(this),
    );
    this.router.get("/alphabet/all", this.getCollectionAll.bind(this));
  }

  private async createCollectionServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const collectionService = new CollectionService(decodedToken);
    this.setCollectionServiceInstance(collectionService);
    next();
  }

  private async getCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.collectionServiceInstance?.getCollection();
      res.status(200).json(user);
    } catch (err: any) {
      next(err);
    }
  }

  private async setCollectionStamp(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: {},
    } = req;
    try {
      const result = await this.collectionServiceInstance?.setCollectionStamp();
      res.status(200).json(result);
    } catch (err: any) {
      next(err);
    }
  }
  private async setCollection(req: Request, res: Response, next: NextFunction) {
    const {
      body: { alphabet },
    } = req;
    try {
      await this.collectionServiceInstance?.setCollection(alphabet);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async changeCollection(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {
      body: { mine, opponent, myId, toUid },
    } = req;
    try {
      const result = await this.collectionServiceInstance?.changeCollection(
        mine,
        opponent,
        myId,
        toUid,
      );
      if (result) res.status(400).json(result);
      else res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async setCollectionCompleted(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result =
        await this.collectionServiceInstance?.setCollectionCompleted();
      if (result === "not completed") {
        res.status(400).json({ message: "not completed" });
      } else {
        res.end();
      }
    } catch (err: any) {
      next(err);
    }
  }

  private async getCollectionAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const users = await this.collectionServiceInstance?.getCollectionAll();
      res.status(200).json(users);
    } catch (err: any) {
      next(err);
    }
  }
}

const collectionController = new CollectionController();
module.exports = collectionController.router;
