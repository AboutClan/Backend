import express, { NextFunction, Request, Response } from "express";
import ImageService from "../services/imageService";
const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const imageService = new ImageService(decodedToken);
  req.imageServiceInstance = imageService;
  next();
});

router
  .route("/upload")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    // if (!req.file) {
    //   return res.status(400).send("No file");
    // }

    const A = await req.imageServiceInstance?.uploadImg();
    return res.status(200).json(A);
  });

module.exports = router;
