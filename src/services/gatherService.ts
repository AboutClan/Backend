import { JWT } from "next-auth/jwt";
import { Counter } from "../db/models/counter";
import { Gather, gatherStatus, IGatherData } from "../db/models/gather";
import { IUser } from "../db/models/user";

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

  async getGather(cursor: number | null) {
    try {
      const gatherData = await Gather.find()
        .populate(["user", "participants.user", "comment.user"])
        .select("-_id");

      if (cursor === null || cursor === undefined) {
        return gatherData.slice().reverse();
      }

      const gap = 12;
      let start = gap + gap * (cursor || 0);
      if (cursor === 0) return gatherData.slice(-start).reverse();
      return gatherData.slice(-start, -start + gap + 1).reverse();
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
