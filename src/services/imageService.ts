import { JWT } from "next-auth/jwt";
import * as AWS from "aws-sdk";
import * as multer from "multer";
import { Readable } from "stream";
import * as multerS3 from "multer-s3";

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
      accessKeyId: "AKIAUJLDUQVNLDWAWBNT",
      secretAccessKey: "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",
      region: "ap-northeast-2",
    });

    this.upload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: "studyabout",
        acl: "public-read",
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, Date.now());
        },
      }),
    });
  }

  async uploadImg() {
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
