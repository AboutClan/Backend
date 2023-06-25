import { JWT } from "next-auth/jwt";
import { Gather, IGatherData, gatherStatus } from "../db/models/gather";
import { IUser } from "../db/models/user";
import { v4 as uuidv4 } from "uuid";

export default class GatherService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getGather() {
    try {
      const gatherData = await Gather.find()
        .populate(["user", "participants"])
        .select("-_id");
      return gatherData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createGather(data: IGatherData) {
    try {
      const randomId = uuidv4().toString();
      const gatherData = { ...data, user: this.token.id, id: randomId };
      await Gather.create(gatherData);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async participateGather(gatherId: string, phase: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) return;

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
    if (!gather) return;

    gather.comment.push({
      user: this.token.id as IUser,
      comment,
    });

    await gather.save();
  }

  async deleteGather(gatherId: string) {
    await Gather.deleteOne({ id: gatherId });

    return;
  }

  async deleteParticipate(gatherId: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) return;

    gather.participants = gather.participants.filter(
      (participant) => participant.user != (this.token.id as IUser)
    );

    await gather.save();
    return;
  }
}
