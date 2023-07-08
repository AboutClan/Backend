import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import GiftService from "../services/giftService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token?.toString() == "undefined" || !token)
    return res.status(401).send("Unauthorized");

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
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { name, cnt, giftId } = req.body;

    const { giftServiceInstance } = req;
    if (!giftServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const user = await giftServiceInstance.setGift(name, cnt, giftId);
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { giftServiceInstance } = req;
    if (!giftServiceInstance) return res.status(401).send("Unauthorized");

    const { id } = req.params;

    try {
      const user = await giftServiceInstance.getGift(parseInt(id));
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { giftServiceInstance } = req;
    if (!giftServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const user = await giftServiceInstance.getAllGift();
      res.status(200).json({ user });
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
