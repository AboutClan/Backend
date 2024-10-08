import { Types } from "mongoose";
import { JWT } from "next-auth/jwt";
import {
  commentType,
  Feed,
  FeedZodSchema,
  subCommentType,
} from "../db/models/feed";
import { IUser, User } from "../db/models/user";
import { convertUsersToSummary } from "../utils/convertUtils";
import ImageService from "./imageService";
import { C_simpleUser } from "../utils/constants";
import { DatabaseError } from "../errors/DatabaseError";
import { ValidationError } from "../errors/ValidationError";

export default class FeedService {
  private token: JWT;
  private imageServiceInstance: ImageService;

  constructor(token?: JWT) {
    this.token = token as JWT;
    this.imageServiceInstance = new ImageService(token);
  }

  async findFeedByType(
    type?: string,
    typeId?: string,
    cursor?: number | null,
    isRecent?: boolean,
  ) {
    const gap = 12;
    let start = gap * (cursor || 0);

    const query: any = { type };
    if (typeId && typeId.trim() !== "") {
      query.typeId = typeId;
    }

    const feeds = await Feed.find(query)
      .populate(["writer", "like", "comments.user"])
      .populate({
        path: "comments.subComments.user",
        select: C_simpleUser,
      })
      .sort({ createdAt: isRecent ? -1 : 1 })
      .skip(start)
      .limit(gap);

    if (isRecent === false) {
      feeds.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    }

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
  }

  async findFeedById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError("invalid mongoDB Id type");
    }

    const feed = await Feed.findById(id)
      .populate(["writer", "like", "comments.user"])
      .populate({
        path: "comments.subComments.user",
        select: C_simpleUser,
      });
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
  }

  async findFeedLikeById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError("invalid mongoDB Id type");
    }
    const feed = await Feed.findById(id).populate(["like"]);
    return convertUsersToSummary(feed?.like as IUser[]);
  }

  async findAllFeeds(cursor: number | null, isRecent?: boolean) {
    const gap = 12;
    let start = gap * (cursor || 0);

    const feeds = await Feed.find()
      .populate(["writer", "like", "comments.user"])
      .populate({
        path: "comments.subComments.user",
        select: C_simpleUser,
      })
      .sort({ createdAt: isRecent ? -1 : 1 })
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
  }

  async createFeed({
    title,
    text,
    type,
    buffers,
    typeId,
    isAnonymous,
    subCategory,
  }: any) {
    const images = await this.imageServiceInstance.uploadImgCom(
      "feed",
      buffers,
    );
    const validatedFeed = FeedZodSchema.parse({
      title,
      text,
      writer: this.token.id,
      type,
      typeId,
      images,
      isAnonymous: Boolean(isAnonymous),
      subCategory,
    });

    await Feed.create(validatedFeed);
    return;
  }
  async createComment(feedId: string, content: string) {
    const message: commentType = {
      user: this.token.id,
      comment: content,
    };

    //transaction
    const feed = await Feed.findByIdAndUpdate(
      feedId,
      { $push: { comments: message } },
      { new: true, useFindAndModify: false },
    );

    if (!feed) throw new DatabaseError("reate comment failed");

    const user = await User.findOneAndUpdate(
      { uid: this.token.uid },
      { $inc: { point: 2 } },
      { new: true, useFindAndModify: false },
    );
    if (!user) throw new DatabaseError("update score failed");

    return;
  }

  async deleteComment(feedId: string, commentId: string) {
    const feed = await Feed.findByIdAndUpdate(
      feedId,
      { $pull: { comments: { _id: commentId } } },
      { new: true, useFindAndModify: false },
    );

    if (!feed) throw new DatabaseError("delete comment failed");

    return;
  }

  async updateComment(feedId: string, commentId: string, comment: string) {
    const result = await Feed.findOneAndUpdate(
      { _id: feedId, "comments._id": commentId },
      {
        $set: {
          "comments.$.comment": comment,
        },
      },
    );

    if (!result) throw new DatabaseError("update comment failed");

    return result;
  }

  async createCommentLike(feedId: string, commentId: string) {
    const feed = await Feed.findOneAndUpdate(
      {
        _id: feedId,
        "comments._id": commentId,
      },
      {
        $addToSet: { "comments.$.likeList": this.token.id },
      },
      { new: true }, // 업데이트된 도큐먼트를 반환
    );

    if (!feed) {
      throw new DatabaseError("create comment like failed");
    }
    return;
  }

  async createSubCommentLike(
    feedId: string,
    commentId: string,
    subCommentId: string,
  ) {
    const feed = await Feed.findOneAndUpdate(
      {
        _id: feedId,
        "comments._id": commentId,
        "comments.subComments._id": subCommentId,
      },
      {
        $addToSet: {
          "comments.$[comment].subComments.$[subComment].likeList":
            this.token.id,
        },
      },
      {
        arrayFilters: [
          { "comment._id": commentId },
          { "subComment._id": subCommentId },
        ],
        new: true, // 업데이트된 도큐먼트를 반환
      },
    );

    if (!feed) {
      throw new DatabaseError("create subcomment like failed");
    }
  }

  async createSubComment(feedId: string, commentId: string, content: string) {
    const message: subCommentType = {
      user: this.token.id,
      comment: content,
    };

    const updated = await Feed.updateOne(
      {
        _id: feedId,
        "comments._id": commentId,
      },
      { $push: { "comments.$.subComments": message } },
    );

    if (!updated.modifiedCount) throw new DatabaseError("nothing updated");

    return;
  }

  async deleteSubComment(
    feedId: string,
    commentId: string,
    subCommentId: string,
  ) {
    const updated = await Feed.updateOne(
      {
        _id: feedId,
        "comments._id": commentId,
      },
      { $pull: { "comments.$.subComments": { _id: subCommentId } } },
    );

    if (!updated.modifiedCount) throw new DatabaseError("nothing updated");
  }

  async updateSubComment(
    feedId: string,
    commentId: string,
    subCommentId: string,
    comment: string,
  ) {
    const updated = await Feed.updateOne(
      {
        _id: feedId,
        "comments._id": commentId,
        "comments.subComments._id": subCommentId,
      },
      { $set: { "comments.$[].subComments.$[sub].comment": comment } },
      {
        arrayFilters: [{ "sub._id": subCommentId }],
      },
    );

    if (!updated.modifiedCount) throw new DatabaseError("nothing updated");
    return;
  }

  async toggleLike(feedId: string) {
    const feed = await Feed.findById(feedId);

    const isLikePush = await feed?.addLike(this.token.id);

    const user = await User.findOne({ uid: this.token.uid });
    if (!user) return;
    if (isLikePush) user.point += 2;
    else user.point -= 1;
    await user.save();
    return;
  }
}
