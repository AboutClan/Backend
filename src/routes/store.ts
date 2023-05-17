import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import StoreService from "../services/storeService";
import { GiftModel } from "../db/models/gift";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token?.toString() == "undefined" || !token) return;

  const decodedToken = await decode({
    token,
    secret: "klajsdflksjdflkdvdssdq231e1w",
  });

  if (!decodedToken) {
    return res.status(401).send("Unauthorized");
  } else {
    const storeService = new StoreService(decodedToken);
    req.storeServiceInstance = storeService;
    next();
  }
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { storeServiceInstance } = req;
    if (!storeServiceInstance) return res.status(401).send("Unauthorized");

    await storeServiceInstance.getAllGift();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { name, cnt, giftId } = req.body;

    const { storeServiceInstance } = req;
    if (!storeServiceInstance) return res.status(401).send("Unauthorized");

    const user = await storeServiceInstance.setGift(name, cnt, giftId);

    res.status(200).json({ user });
  });

router
  .route("/gift/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { storeServiceInstance } = req;
    if (!storeServiceInstance) return res.status(401).send("Unauthorized");

    await storeServiceInstance.getGift();
  });
