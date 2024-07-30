import { Types } from "mongoose";
import { JWT } from "next-auth/jwt";
import { commentType, Feed } from "../db/models/feed";
import { IUser, User } from "../db/models/user";
import { convertUsersToSummary } from "../utils/convertUtils";
import ImageService from "./imageService";

export default class FeedService {
  private token: JWT;
  private imageServiceInstance: ImageService;

  constructor(token?: JWT) {
    this.token = token as JWT;
    this.imageServiceInstance = new ImageService(token);
  }

  async findFeedByType(type?: string, typeId?: string, cursor?: number | null) {
    try {
      const gap = 12;
      let start = gap * (cursor || 0);

      const query: any = { type };
      if (typeId && typeId.trim() !== "") {
        query.typeId = typeId;
      }

      const feeds = await Feed.find(query)
        .populate(["writer", "like", "comments.user"])
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(gap);

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

      const feed = await Feed.findById(id).populate([
        "writer",
        "like",
        "comments.user",
      ]);
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
        .populate(["writer", "like", "comments.user"])
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(gap);

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

  async createFeed({ title, text, type, buffers, typeId, isAnonymous }: any) {
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
        isAnonymous,
      });
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async createComment(feedId: string, content: string) {
    try {
      const feed = await Feed.findById(feedId);

      const message: commentType = {
        user: this.token.id,
        comment: content,
      };
      await feed?.updateOne({ $push: { comments: message } });
      await feed?.save();

      const user = await User.findOne({ uid: this.token.uid });
      if (user) user.point += 2;
      await user?.save();

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async deleteComment(feedId: string, commentId: string) {
    try {
      const feed = await Feed.findById(feedId);

      await feed?.updateOne({ $pull: { comments: { _id: commentId } } });
      await feed?.save();
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateComment(feedId: string, commentId: string, comment: string) {
    try {
      const result = await Feed.findOneAndUpdate(
        { _id: feedId, "comments._id": commentId },
        {
          $set: {
            "comments.$.comment": comment,
          },
        },
      );

      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async toggleLike(feedId: string) {
    try {
      const feed = await Feed.findById(feedId);
      const isLikePush = await feed?.addLike(
        this.token.id as unknown as string,
      );

      const user = await User.findOne({ uid: this.token.uid });
      if (!user) return;
      if (isLikePush) user.point += 2;
      else user.point -= 1;
      await user.save();
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
