import { JWT } from "next-auth/jwt";
import { Feed } from "../db/models/feed";
import ImageService from "./imageService";
import { Types } from "mongoose";

export default class FeedService {
  private token: JWT;
  private imageServiceInstance: ImageService;

  constructor(token?: JWT) {
    this.token = token as JWT;
    this.imageServiceInstance = new ImageService(token);
  }

  async findFeedById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        console.log("이게 머지");
      }

      const feed = await Feed.findById(id);
      return feed;
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async createFeed({ title, text, writer, type, buffer }: any) {
    try {
      const location = await this.imageServiceInstance.uploadImgCom(
        "feed",
        buffer,
      );

      await Feed.create({ title, text, writer, type, imageUrl: location });

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
