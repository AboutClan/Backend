import { JWT } from "next-auth/jwt";
import { Gather, IGatherData, gatherStatus } from "../db/models/gather";
import { IUser, User } from "../db/models/user";
import { v4 as uuidv4 } from "uuid";
import { Counter } from "../db/models/counter";
import dbConnect from "../db/conn";

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

  async getGather() {
    try {
      const gatherData = await Gather.find()
        .populate(["user", "participants.user", "comment.user"])
        .select("-_id");
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

  async participateGather(gatherId: string, phase: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      if (
        !gather.participants.some(
          (participant) => participant.user == (this.token.id as IUser)
        )
      ) {
        gather.participants.push({
          user: this.token.id as IUser,
          phase,
        });

        await gather?.save();
      }

      return;
    } catch (err) {
      throw new Error();
    }
  }

  async setStatus(gatherId: string, status: gatherStatus) {
    try {
      await Gather.updateOne({ id: gatherId }, { status });
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createComment(gatherId: string, comment: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      gather.comment.push({
        user: this.token.id as IUser,
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
      gather.comment = gather.comment.filter(
        (com: any) => (com._id as string) != commentId
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
      gather.comment.forEach(async (com: any) => {
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

  async deleteParticipate(gatherId: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) throw new Error();

    try {
      gather.participants = gather.participants.filter(
        (participant) => participant.user != (this.token.id as IUser)
      );
      await gather.save();
    } catch (err) {
      throw new Error();
    }
    return;
  }
}
