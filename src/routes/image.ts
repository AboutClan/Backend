import express, { NextFunction, Request, Response, Router } from "express";
import ImageService from "../services/imageService";
let AWS = require("aws-sdk");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");

class ImageController {
  public router: Router;
  private imageServiceInstance: ImageService;
  private s3: any;
  private upload2: any;

  constructor() {
    this.router = Router();
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_KEY,
      region: "ap-northeast-2",
    });
    this.upload2 = multer({ storage: multer.memoryStorage() });
    this.imageServiceInstance = new ImageService();
    this.initializeRoutes();
  }

  public setImageServiceInstance(instance: ImageService) {
    this.imageServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createImageServiceInstance.bind(this));

    this.router.post(
      "/upload/vote",
      this.upload2.single("image"),
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

  private async uploadVoteImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    let myFile = req.file?.originalname;
    let path = req.body.path;

    const params = {
      Bucket: "studyabout",
      Key: `${path}/${Math.floor(Date.now() / 1000).toString()}`,
      Body: req.file?.buffer,
    };

    this.s3.upload(params, async (error: any, data: any) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          message: "사진 파일이 잘못되었습니다.",
        });
      }

      try {
        await this.imageServiceInstance?.saveImage(data.Location);

        return res.status(201).json({
          ok: true,
          message: "사진이 성공적으로 업로드 되었습니다.",
          data: {
            image: req.file,
          },
        });
      } catch (err) {
        next(err);
      }
    });
  }
}

const imageController = new ImageController();
module.exports = imageController.router;
