import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import GiftService from "../services/giftService";

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
    const giftService = new GiftService(decodedToken);
    req.giftServiceInstance = giftService;
    next();
  }
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { giftServiceInstance } = req;
    if (!giftServiceInstance) return res.status(401).send("Unauthorized");

    await giftServiceInstance.getGift();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { name, cnt, giftId } = req.body;

    const { giftServiceInstance } = req;
    if (!giftServiceInstance) return res.status(401).send("Unauthorized");

    const user = await giftServiceInstance.setGift(name, cnt, giftId);

    res.status(200).json({ user });
  });

router
  .route("/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { giftServiceInstance } = req;
    if (!giftServiceInstance) return res.status(401).send("Unauthorized");

    await giftServiceInstance.getAllGift();
  });

module.exports = router;
