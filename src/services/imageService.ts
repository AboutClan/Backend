import { JWT } from "next-auth/jwt";
let AWS = require("aws-sdk");
let multer = require("multer");
import { Readable } from "stream";
import { findOneVote } from "../utils/voteUtils";
import { IUser } from "../db/models/user";
import { strToDate } from "../utils/dateUtils";
let multerS3 = require("multer-s3");

export default class ImageService {
  private token: JWT;
  private upload;
  private s3;

  constructor(token?: JWT) {
    this.token = token as JWT;

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
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

  async uploadImg(img: any) {
    const stringObject = JSON.stringify(img);
    const objectStream = Readable.from([stringObject]);

    const params = {
      Bucket: "studyabout",
      Key: "test.jpg",
      Body: objectStream,
    };

    await this.s3.upload(params, (err: any, data: any) => {
      if (err) throw err;
    });

    return;
  }

  getToday() {
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + month + day;
  }

  async saveImage(imageUrl: string) {
    const vote = await findOneVote(strToDate(this.getToday()).toDate());
    if (!vote) throw new Error();

    vote?.participations.forEach((participation) => {
      participation.attendences?.forEach((attendence) => {
        if (
          (attendence.user as IUser)?.uid.toString() ===
          this.token.uid?.toString()
        )
          attendence.imageUrl = imageUrl;
      });
    });

    await vote?.save();
    return;
  }
}
