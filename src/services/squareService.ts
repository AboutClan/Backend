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

  constructor() {
    this.imageServiceInstance = new ImageService();
  }

  async getSquareList({
    category,
  }: {
    category: SecretSquareCategory | "all";
  }) {
    if (category === "all") {
      return await SecretSquare.aggregate([
        {
          $project: {
            category: 1,
            title: 1,
            content: 1,
            type: 1,
            thumbnail: { $slice: ["$images", 1] },
            viewCount: 1,
            likeCount: { $size: "$like" },
            commentsCount: { $size: "$comments" },
          },
        },
      ]);
    }
    return await SecretSquare.aggregate([
      {
        $match: {
          category,
        },
      },
      {
        $project: {
          category: 1,
          title: 1,
          content: 1,
          type: 1,
          thumbnail: { $slice: ["$images", 1] },
          viewCount: 1,
          likeCount: { $size: "$like" },
          commentsCount: { $size: "$comments" },
        },
      },
    ]);
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
    await SecretSquare.findByIdAndUpdate(squareId, {
      $inc: { viewCount: 1 },
    });

    const secretSquare = await SecretSquare.findById(squareId, {
      category: 1,
      title: 1,
      content: 1,
      type: 1,
      poll: 1,
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
    user,
    comment,
    squareId,
  }: {
    user: string;
    comment: string;
    squareId: string;
  }) {
    await SecretSquare.findByIdAndUpdate(squareId, {
      $push: { comments: { user, comment } },
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
    user,
    pollItems,
  }: {
    squareId: string;
    user: string;
    pollItems: string[];
  }) {
    const secretSquare = await SecretSquare.findById(squareId);

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("not found");
    }

    secretSquare.poll.pollItems.forEach((pollItem) => {
      // HACK Is is correct to write type assertion? Another solution?
      const index = pollItem.users.indexOf(user as unknown as Types.ObjectId);
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
          secretSquare.poll.pollItems[index].users.push(
            user as unknown as Types.ObjectId,
          );
        }
      });
    }

    await secretSquare.save();
  }

  async getCurrentPollItems({
    squareId,
    user,
  }: {
    squareId: string;
    user: string;
  }) {
    const secretSquare = await SecretSquare.findById(squareId);

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("not found");
    }
    const pollItems: string[] = [];

    secretSquare.poll.pollItems.forEach((pollItem) => {
      if (!pollItem.users.includes(user as unknown as Types.ObjectId)) return;
      pollItems.push(pollItem._id.toString());
    });

    return pollItems;
  }

  async putLikeSquare({ squareId, user }: { squareId: string; user: string }) {
    const secretSquare = await SecretSquare.findById(squareId);

    if (!secretSquare) {
      throw new Error("not found");
    }

    if (secretSquare.like.includes(user as unknown as Types.ObjectId)) {
      throw new Error("already included");
    }

    secretSquare.like.push(user as unknown as Types.ObjectId);
    await secretSquare.save();
  }

  async deleteLikeSquare({
    squareId,
    user,
  }: {
    squareId: string;
    user: string;
  }) {
    await SecretSquare.findByIdAndUpdate(squareId, {
      $pull: { like: user },
    });
  }
}
