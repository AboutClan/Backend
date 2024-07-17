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
  private s3: any;

  constructor(token?: JWT) {
    this.token = token as JWT;

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_KEY,
      region: "ap-northeast-2",
    });
  }

  async uploadImg(myFile: any, path: any, buffer: any) {
    const params = {
      Bucket: "studyabout",
      Key: `${path}/${Math.floor(Date.now() / 1000).toString()}`,
      Body: buffer,
    };

    await this.s3.upload(params, async (error: any, data: any) => {
      if (error) {
        throw new Error();
      }

      try {
        await this.saveImage(data.Location);

        return data;
      } catch (err) {
        throw new Error();
      }
    });
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
