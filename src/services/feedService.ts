import { Types } from "mongoose";
import { JWT } from "next-auth/jwt";
import { Feed } from "../db/models/feed";
import { IUser } from "../db/models/user";
import { convertUsersToSummary } from "../utils/convertUtils";
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
      const feeds = await Feed.find({ type, typeId }).populate([
        "writer",
        "like",
      ]);

      return feeds?.map((feed) => {
        const myLike = (feed?.like as IUser[])?.find(
          (who) => who.uid === this.token.uid,
        );
        let modifiedLike;
        if (myLike) {
          modifiedLike = [
            myLike,
            ...(feed.like as IUser[])
              .filter((who) => who.uid !== myLike.uid)
              .slice(0, 7),
          ];
        } else {
          modifiedLike = feed.like.slice(0, 8);
        }
        return {
          ...feed.toObject(),
          like: modifiedLike,
          likeCnt: feed?.like?.length,
        };
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async findFeedById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        console.log("이게 머지");
      }

      const feed = await Feed.findById(id).populate(["writer", "like"]);
      const myLike = (feed?.like as IUser[])?.find(
        (who) => who.uid === this.token.uid,
      );
      let modifiedLike;
      if (myLike) {
        modifiedLike = [
          myLike,
          ...(feed?.like as IUser[])
            .filter((who) => who.uid !== myLike.uid)
            .slice(0, 7),
        ];
      } else {
        modifiedLike = feed?.like.slice(0, 8);
      }
      return {
        ...feed?.toObject(),
        like: modifiedLike,
        likeCnt: feed?.like?.length,
      };
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async findFeedLikeById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        console.log("이게 머지");
      }
      const feed = await Feed.findById(id).populate(["like"]);
      return convertUsersToSummary(feed?.like as IUser[]);
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async findAllFeeds(cursor: number | null) {
    try {
      const gap = 12;
      let start = gap * (cursor || 0);

      const feeds = await Feed.find()
        .populate(["writer", "like"])
        .skip(start)
        .limit(gap + 1)
        .select("-_id");

      return feeds?.map((feed) => {
        const myLike = (feed?.like as IUser[])?.find(
          (who) => who.uid === this.token.uid,
        );
        let modifiedLike;
        if (myLike) {
          modifiedLike = [
            myLike,
            ...(feed.like as IUser[])
              .filter((who) => who.uid !== myLike.uid)
              .slice(0, 7),
          ];
        } else {
          modifiedLike = feed.like.slice(0, 8);
        }
        return {
          ...feed.toObject(),
          like: modifiedLike,
          likeCnt: feed?.like?.length,
        };
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createFeed({ title, text, type, buffers, typeId }: any) {
    try {
      const images = await this.imageServiceInstance.uploadImgCom(
        "feed",
        buffers,
      );
      await Feed.create({
        title,
        text,
        writer: this.token.id,
        type,
        typeId,
        images,
      });
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async toggleLike(feedId: string) {
    try {
      const feed = await Feed.findById(feedId);
      await feed?.addLike(this.token.id as unknown as string);

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
