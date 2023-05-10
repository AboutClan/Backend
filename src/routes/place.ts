import express, { NextFunction, Request, Response } from "express";
import PlaceService from "../services/placeService";
import { decode } from "next-auth/jwt";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const placeServiceInstance = new PlaceService();
  req.placeServiceInstance = placeServiceInstance;
  next();
});

module.exports = router;
