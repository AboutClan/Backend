import { JWT } from "next-auth/jwt";
import { Feed } from "../db/models/feed";

export default class FeedService {
  private token: JWT;

  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async findFeedById(id: string) {
    const feed = await Feed.findOne({ _id: id });

    return feed;
  }
  async createFeed({ title, text, imageUrl, writer, type }: any) {}
}
