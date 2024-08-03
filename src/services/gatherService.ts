import { JWT } from "next-auth/jwt";
import { Counter } from "../db/models/counter";
import {
  Gather,
  gatherStatus,
  IGatherData,
  subCommentType,
} from "../db/models/gather";
import { IUser, User } from "../db/models/user";
import dbConnect from "../db/conn";

const logger = require("../../logger");

export default class GatherService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getNextSequence(name: any) {
    const counter = await Counter.findOne({ key: name });
    if (counter) {
      counter.seq++;

      await counter.save();
      return counter.seq;
    }
  }

  async getGatherById(gatherId: number) {
    const gatherData = await Gather.findOne({ id: gatherId }).populate([
      "user",
      "participants.user",
      "comments.user",
    ]);

    return gatherData;
  }

  async getThreeGather() {
    const gatherData = await Gather.find()
      .populate(["user", "participants.user", "comments.user"])
      .sort({ id: -1 })
      .limit(3);

    return gatherData;
  }

  async getGather(cursor: number | null) {
    try {
      const gap = 12;
      let start = gap * (cursor || 0);

      let gatherData = await Gather.find()
        .sort({ id: -1 })
        .skip(start)
        .limit(gap)
        .select("-_id");

      gatherData = await Gather.populate(gatherData, [
        { path: "user" },
        { path: "participants.user" },
        { path: "comments.user" },
      ]);
      return gatherData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  //place 프론트에서 데이터 전송으로 인해 생성 삭제
  async createGather(data: IGatherData) {
    const nextId = await this.getNextSequence("counterid");

    const gatherInfo = {
      ...data,
      user: this.token.id,
      id: nextId,
    };

    try {
      const gatherData = gatherInfo;
      await Gather.create(gatherData);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateGather(gather: IGatherData) {
    try {
      await Gather.updateOne({ id: gather.id }, gather);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async participateGather(gatherId: string, phase: string, userId: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      const id = userId ?? this.token.id;
      if (!gather.participants.some((participant) => participant.user == id)) {
        gather.participants.push({
          user: id,
          phase,
        });
        await gather?.save();
      }
      const user = await User.findOne({ _id: id });
      if (!user) throw new Error();
      user.score += 5;
      user.monthScore += 5;
      await user.save();
      logger.logger.info("번개 모임 참여", {
        metadata: {
          type: "score",
          uid: user.uid,
          value: 5,
        },
      });

      return;
    } catch (err) {
      throw new Error();
    }
  }

  async deleteParticipate(gatherId: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      gather.participants = gather.participants.filter(
        (participant) => participant.user != this.token.id,
      );
      await gather.save();
      const user = await User.findOne({ _id: this.token.id });
      if (!user) throw new Error();
      user.score -= 5;
      await user.save();
      logger.logger.info("번개 모임 참여 취소", {
        metadata: {
          type: "score",
          uid: user.uid,
          value: -5,
        },
      });
    } catch (err) {
      throw new Error();
    }
    return;
  }

  async setStatus(gatherId: string, status: gatherStatus) {
    try {
      await Gather.updateOne({ id: gatherId }, { status });
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createSubComment(gatherId: string, commentId: string, content: string) {
    try {
      const message: subCommentType = {
        user: this.token.id,
        comment: content,
      };

      await Gather.updateOne(
        {
          _id: gatherId,
          "comments._id": commentId,
        },
        { $push: { "comments.$.subComments": message } },
      );

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async deleteSubComment(
    gatherId: string,
    commentId: string,
    subCommentId: string,
  ) {
    try {
      await Gather.updateOne(
        {
          _id: gatherId,
          "comments._id": commentId,
        },
        { $pull: { "comments.$.subComments": { _id: subCommentId } } },
      );
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateSubComment(
    gatherId: string,
    commentId: string,
    subCommentId: string,
    comment: string,
  ) {
    try {
      const gathers = await Gather.find();

      gathers.forEach((gather) => {
        gather.comments.forEach((comment) => {
          comment.subComments = [];
        });
        gather.save();
      });

      // await Gather.updateOne(
      //   {
      //     _id: gatherId,
      //     "comments._id": commentId,
      //     "comments.subComments._id": subCommentId,
      //   },
      //   { $set: { "comments.$[].subComments.$[sub].comment": comment } },
      //   {
      //     arrayFilters: [{ "sub._id": subCommentId }],
      //   },
      // );

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createComment(gatherId: string, comment: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      gather.comments.push({
        user: this.token.id,
        comment,
      });

      await gather.save();
    } catch (err) {
      throw new Error();
    }
  }

  async deleteComment(gatherId: string, commentId: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      gather.comments = gather.comments.filter(
        (com: any) => (com._id as string) != commentId,
      );

      await gather.save();
    } catch (err) {
      throw new Error();
    }
  }

  async patchComment(gatherId: string, commentId: string, comment: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      gather.comments.forEach(async (com: any) => {
        if ((com._id as string) == commentId) {
          com.comment = comment;
          await gather.save();
        }
      });
      return;
    } catch (err) {
      throw new Error();
    }
  }

  async deleteGather(gatherId: string) {
    try {
      await Gather.deleteOne({ id: gatherId });
    } catch (err) {
      throw new Error();
    }

    return;
  }
}
