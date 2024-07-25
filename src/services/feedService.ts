import { Types } from "mongoose";
import { JWT } from "next-auth/jwt";
import { Feed } from "../db/models/feed";
import ImageService from "./imageService";

export default class FeedService {
  private token: JWT;
  private imageServiceInstance: ImageService;

  constructor(token?: JWT) {
    this.token = token as JWT;
    this.imageServiceInstance = new ImageService(token);
  }

  async findFeedByType(type: string, typeId: string) {
    try {
      const feed = await Feed.find({ type, typeId });
      return feed;
    } catch (err: any) {
      throw new Error(err);
    }
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

  async findAllFeeds(cursor: number | null) {
    try {
      const gap = 12;
      let start = gap * (cursor || 0);

      const feeds = await Feed.find()
        .skip(start)
        .limit(gap + 1)
        .select("-_id");

      return feeds;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createFeed({ title, text, writer, type, buffers, typeId }: any) {
    try {
      const location = await this.imageServiceInstance.uploadImgCom(
        "feed",
        buffers,
      );
      await Feed.create({
        title,
        text,
        writer,
        type,
        typeId,
        imageUrl: location,
      });
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async toggleLike(feedId: string) {
    try {
      const feed = await this.findFeedById(feedId);
      await feed?.addLike(this.token.uid);

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
