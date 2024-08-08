import { type JWT } from "next-auth/jwt/types";
import {
  SecretSquareCategory,
  SecretSquare,
  SecretSquareType,
} from "../db/models/secretSquare";
import ImageService from "./imageService";
import { type Types } from "mongoose";

interface Square {
  category: SecretSquareCategory;
  title: string;
  content: string;
  type: SecretSquareType;
  poll: {
    pollItems: { name: string }[];
    canMultiple: boolean;
  };
  author: string;
}

export default class SquareService {
  private imageServiceInstance: ImageService;
  private token: JWT;

  constructor(token?: JWT) {
    this.token = token as JWT;
    this.imageServiceInstance = new ImageService();
  }

  async getSquareList({
    category,
  }: {
    category: SecretSquareCategory | "all";
  }) {
    return await SecretSquare.find(category === "all" ? {} : { category }, {
      category: 1,
      title: 1,
      content: 1,
      type: 1,
      thumbnail: {
        $cond: {
          if: { $eq: [{ $size: "$images" }, 0] },
          then: "",
          else: { $arrayElemAt: ["$images", 0] },
        },
      },
      viewCount: 1,
      likeCount: { $size: "$like" },
      commentsCount: { $size: "$comments" },
      createdAt: 1,
    }).sort({ createdAt: "desc" });
  }

  async createSquare(square: Square & { buffers: Buffer[] }) {
    const {
      category,
      title,
      content,
      type: squareType,
      author,
      poll: { pollItems, canMultiple },
      buffers,
    } = square;

    let images: string[] = [];
    if (buffers.length !== 0) {
      images = await this.imageServiceInstance.uploadImgCom(
        "secret-square",
        buffers,
      );
    }

    if (squareType === "poll") {
      await SecretSquare.create({
        category,
        title,
        content,
        author,
        type: squareType,
        poll: {
          pollItems,
          canMultiple,
        },
        images,
      });
    } else {
      await SecretSquare.create({
        category,
        title,
        content,
        author,
        type: squareType,
        images,
      });
    }
  }

  async deleteSquare(squareId: string) {
    await SecretSquare.findByIdAndDelete(squareId);
  }

  async getSquare(squareId: string) {
    // FIXME count up the only 1 if the same user does the multiple request
    await SecretSquare.findByIdAndUpdate(squareId, {
      $inc: { viewCount: 1 },
    });

    const secretSquare = await SecretSquare.findById(squareId, {
      category: 1,
      title: 1,
      content: 1,
      type: 1,
      poll: {
        pollItems: {
          $map: {
            input: "$poll.pollItems",
            as: "pollItem",
            in: {
              _id: "$$pollItem._id",
              name: "$$pollItem.name",
              count: { $size: "$$pollItem.users" },
              users: 0,
            },
          },
        },
        canMultiple: 1,
      },
      images: 1,
      viewCount: 1,
      likeCount: { $size: "$like" },
      comments: {
        $map: {
          input: "$comments",
          as: "comment",
          in: {
            _id: "$$comment._id",
            comment: "$$comment.comment",
            createdAt: "$$comment.createdAt",
            updatedAt: "$$comment.updatedAt",
          },
        },
      },
      createdAt: 1,
      updatedAt: 1,
    });

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("not found");
    }

    return secretSquare;
  }

  async createSquareComment({
    comment,
    squareId,
  }: {
    comment: string;
    squareId: string;
  }) {
    await SecretSquare.findByIdAndUpdate(squareId, {
      $push: { comments: { user: this.token.id, comment } },
    });
  }

  async deleteSquareComment({
    squareId,
    commentId,
  }: {
    squareId: string;
    commentId: string;
  }) {
    await SecretSquare.findByIdAndUpdate(squareId, {
      $pull: { comments: { _id: commentId } },
    });
  }

  async patchPoll({
    squareId,
    pollItems,
  }: {
    squareId: string;
    pollItems: string[];
  }) {
    const secretSquare = await SecretSquare.findById(squareId);

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("not found");
    }

    // HACK Is is correct to write type assertion? Another solution?
    const user = this.token.id as unknown as Types.ObjectId;

    secretSquare.poll.pollItems.forEach((pollItem) => {
      const index = pollItem.users.indexOf(user);
      if (index > -1) {
        pollItem.users.splice(index, 1);
      }
    });

    if (pollItems.length !== 0) {
      pollItems.forEach((pollItemId) => {
        const index = secretSquare.poll.pollItems.findIndex((pollItem) =>
          pollItem._id.equals(pollItemId),
        );
        if (index > -1) {
          secretSquare.poll.pollItems[index].users.push(user);
        }
      });
    }

    await secretSquare.save();
  }

  async getCurrentPollItems({ squareId }: { squareId: string }) {
    const secretSquare = await SecretSquare.findById(squareId);

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("not found");
    }
    const user = this.token.id as unknown as Types.ObjectId;
    const pollItems: string[] = [];

    secretSquare.poll.pollItems.forEach((pollItem) => {
      if (!pollItem.users.includes(user)) return;
      pollItems.push(pollItem._id.toString());
    });

    return pollItems;
  }

  async putLikeSquare({ squareId }: { squareId: string }) {
    const secretSquare = await SecretSquare.findById(squareId);

    if (!secretSquare) {
      throw new Error("not found");
    }

    const user = this.token.id as unknown as Types.ObjectId;

    if (secretSquare.like.includes(user)) {
      throw new Error("already included");
    }

    secretSquare.like.push(user);
    await secretSquare.save();
  }

  async deleteLikeSquare({ squareId }: { squareId: string }) {
    const user = this.token.id;

    await SecretSquare.findByIdAndUpdate(squareId, {
      $pull: { like: user },
    });
  }
}
