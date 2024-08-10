import { NextFunction, Request, Response, Router } from "express";
import ImageService from "../services/imageService";
import multer from "multer";

class ImageController {
  public router: Router;
  private imageServiceInstance: ImageService;
  private upload: multer.Multer;

  constructor() {
    this.router = Router();
    this.imageServiceInstance = new ImageService();
    this.upload = multer({ storage: multer.memoryStorage() });
    this.initializeRoutes();
  }

  public setImageServiceInstance(instance: ImageService) {
    this.imageServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createImageServiceInstance.bind(this));

    this.router.post(
      "/upload",
      this.upload.single("image"),
      this.uploadImage.bind(this),
    );

    this.router.post(
      "/upload/vote",
      this.upload.single("image"),
      this.uploadVoteImage.bind(this),
    );
  }

  private async createImageServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const collectionService = new ImageService(decodedToken);
    this.setImageServiceInstance(collectionService);
    next();
  }

  private async uploadImage(req: Request, res: Response, next: NextFunction) {
    const path = req.body.path;
    const buffer = req.file?.buffer;

    if (!buffer)
      return res.status(400).json({
        ok: false,
        message: "사진 파일이 잘못되었습니다.",
      });

    try {
      const location = await this.imageServiceInstance.uploadSingleImage(
        path,
        buffer,
      );

      return res.status(201).json({
        ok: true,
        message: "사진이 성공적으로 업로드 되었습니다.",
        data: {
          location,
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        ok: false,
        message: "사진 파일이 잘못되었습니다.",
      });
    }
  }

  private async uploadVoteImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const path = req.body.path;
    const buffer = req.file?.buffer;

    if (!buffer)
      return res.status(400).json({
        ok: false,
        message: "사진 파일이 잘못되었습니다.",
      });

    try {
      const location = await this.imageServiceInstance.uploadSingleImage(
        path,
        buffer,
      );
      await this.imageServiceInstance.saveImage(location);

      return res.status(201).json({
        ok: true,
        message: "사진이 성공적으로 업로드 되었습니다.",
        data: {
          image: req.file,
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        ok: false,
        message: "사진 파일이 잘못되었습니다.",
      });
    }
  }
}

const imageController = new ImageController();
module.exports = imageController.router;
