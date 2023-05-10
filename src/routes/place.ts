import express, { NextFunction, Request, Response } from "express";
import PlaceService from "../services/placeService";
import { decode } from "next-auth/jwt";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const placeServiceInstance = new PlaceService();
  req.placeServiceInstance = placeServiceInstance;
  next();
});

router.route("/").get(async (req, res, next) => {
  const { placeServiceInstance } = req;
  if (!placeServiceInstance) throw new Error();

  const places = await placeServiceInstance.getActivePlace();

  return res.status(200).json(places);
});

module.exports = router;
