import express, { NextFunction, Request, Response } from "express";
import ImageService from "../services/imageService";
let AWS = require("aws-sdk");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const imageService = new ImageService(decodedToken);
  req.imageServiceInstance = imageService;
  next();
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_KEY,
  region: "ap-northeast-2",
});

const upload2 = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  upload2.single("image"),
  async function (req, res, next) {
    let myFile = req.file?.originalname;
    let path = req.body.path;

    const params = {
      Bucket: "studyabout",
      Key: `${path}/${myFile}`,
      Body: req.file?.buffer,
    };
    s3.upload(params, (error: any, data: any) => {
      if (error) {
        return res.status(400).json({
          ok: false,
          message: "사진 파일이 잘못되었습니다.",
        });
      }
      return res.status(201).json({
        ok: true,
        message: "사진이 성공적으로 업로드 되엇습니다.",
        data: {
          image: req.file,
        },
      });
    });
  }
);

module.exports = router;
