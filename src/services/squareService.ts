import { Comment } from "../db/models/comment";
import {
  SecretSquareCategory,
  SecretSquare,
  SecretSquareType,
} from "../db/models/secretSquare";

// TODO need to resolve type error

interface Square {
  category: SecretSquareCategory;
  title: string;
  content: string;
  type: SecretSquareType;
  poll: { name: string }[];
  canMultiple: boolean;
  author: string;
}

export default class SquareService {
  constructor() {}

  async getSquareList({
    category,
  }: {
    category: SecretSquareCategory | "all";
  }) {
    if (category === "all") {
      return await SecretSquare.find();
    }
    return await SecretSquare.find({ category });
  }

  async createSquare(square: Square) {
    const {
      category,
      title,
      content,
      type: squareType,
      author,
      poll: pollItems,
      canMultiple,
    } = square;

    if (squareType === "poll") {
      await SecretSquare.create({
        category,
        title,
        content,
        author,
        poll: {
          pollItems,
          canMultiple,
        },
      });
    } else {
      await SecretSquare.create({
        category,
        title,
        content,
        author,
      });
    }
  }

  async deleteSquare(squareId: string) {
    await SecretSquare.findByIdAndDelete(squareId);
  }

  async getSquare(squareId: string) {
    const secretSquare = await SecretSquare.findByIdAndUpdate(squareId, {
      $inc: { viewCount: 1 },
    });

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("SecretSquare not found");
    }

    return secretSquare;
  }

  async getSquareComments(squareId: string) {
    const comments = await Comment.find({ squareId });
    return comments;
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
    await Comment.create({ user, comment, squareId });
  }

  async deleteSquareComment(commentId: string) {
    await Comment.findByIdAndDelete(commentId);
  }

  async patchPoll({
    squareId,
    uid,
    pollItems,
  }: {
    squareId: string;
    uid: string;
    pollItems: string[];
  }) {
    const secretSquare = await SecretSquare.findById(squareId);

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("SecretSquare not found");
    }

    if (pollItems.length === 0) {
      secretSquare.poll.pollItems.forEach((pollItem) => {
        const index = pollItem.users.indexOf(uid);
        if (index > -1) {
          pollItem.users.splice(index, 1);
        }
      });
    } else {
      secretSquare.poll.pollItems.forEach((pollItem) => {
        const index = pollItem.users.indexOf(uid);
        if (index > -1) {
          pollItem.users.splice(index, 1);
        }
      });

      pollItems.forEach((pollItemId) => {
        const pollItem = secretSquare.poll.pollItems.find(
          (pollItem) => pollItem._id === pollItemId,
        );
        if (pollItem) {
          pollItem.users.push(uid);
        }
      });
    }

    await secretSquare.save();
  }

  async getCurrentPollItems({
    squareId,
    uid,
  }: {
    squareId: string;
    uid: string;
  }) {
    const secretSquare = await SecretSquare.findById(squareId);

    // TODO 404 NOT FOUND
    if (!secretSquare) {
      throw new Error("SecretSquare not found");
    }
    const pollItems: string[] = [];

    secretSquare.poll.pollItems.forEach((pollItem) => {
      if (!pollItem.users.includes(uid)) return;
      pollItems.push(pollItem._id);
    });

    return pollItems;
  }

  async putLikeSquare({ squareId }: { squareId: string }) {
    await SecretSquare.findByIdAndUpdate(squareId, {
      $inc: { likeCount: 1 },
    });
  }

  async deleteLikeSquare({ squareId }: { squareId: string }) {
    await SecretSquare.findByIdAndUpdate(squareId, {
      $inc: { likeCount: -1 },
    });
  }
}
