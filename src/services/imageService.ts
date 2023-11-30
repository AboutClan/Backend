import { JWT } from "next-auth/jwt";
let AWS = require("aws-sdk");
let multer = require("multer");
import { Readable } from "stream";
let multerS3 = require("multer-s3");

export default class ImageService {
  private token: JWT;
  private upload;
  private s3;

  constructor(token?: JWT) {
    this.token = token as JWT;
    // this.upload = multer.diskStorage({
    //   destination: function (req, file, cb) {
    //     cb(null, "./upload/");
    //   },
    //   filename: function (req, file, cb) {
    //     cb(null, Date.now() + "-" + file.originalname);
    //   },
    // });
    this.s3 = new AWS.S3({
      accessKeyId: "",
      secretAccessKey: process.env.AWS_KEY,
      region: "ap-northeast-2",
    });

    this.upload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: "studyabout",
        acl: "public-read",
        metadata: function (req: any, file: any, cb: any) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req: any, file: any, cb: any) {
          cb(null, Date.now());
        },
      }),
    });
  }

  async uploadImg() {
    return "test";
    const testObject = {
      test: "da",
    };
    const stringObject = JSON.stringify(testObject);
    const objectStream = Readable.from([stringObject]);

    const params = {
      Bucket: "studyabout",
      Key: "test",
      Body: objectStream,
    };

    await this.s3.upload(params, (err: any, data: any) => {
      if (err) throw err;
    });

    return;
  }
}
