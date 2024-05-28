import express, { NextFunction, Request, Response } from "express";
import PlaceService from "../services/placeService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const placeServiceInstance = new PlaceService(decodedToken);
  req.placeServiceInstance = placeServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { placeServiceInstance } = req;

     const status: "active" | "inactive" = (req.query?.status as "active" | "inactive") || "active";
    try {
      const places = await placeServiceInstance?.getActivePlace(status||"active");
      return res.status(200).json(places);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    const { placeServiceInstance } = req;
    const placeInfo = req.body;

    try {
      const places = await placeServiceInstance?.addPlace(placeInfo);
      return res.status(200).json(places);
    } catch (err: any) {
      next(err);
    }
  });

router.route("/status").post(async (req, res, next) => {
  const { placeServiceInstance } = req;
  const { placeId, status } = req.body;

  try {
    const places = await placeServiceInstance?.updateStatus(placeId, status);
    return res.status(200).json(places);
  } catch (err: any) {
    next(err);
  }
});

module.exports = router;
