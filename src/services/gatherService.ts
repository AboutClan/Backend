import { JWT } from "next-auth/jwt";
import { Gather, IGatherData, gatherStatus } from "../db/models/gather";
import { IUser } from "../db/models/user";

export default class GatherService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getGather() {
    try {
      const gatherData = await Gather.find().populate("user").select("-_id");
      return gatherData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createGather(data: IGatherData) {
    try {
      await Gather.create({ ...data, user: this.token.id });
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async participateGather(gatherId: string) {
    const gather = await Gather.findOne({ id: gatherId });
    if (!gather) return;

    if (!gather.participants.includes(this.token.id as IUser)) {
      gather.participants = [
        ...(gather?.participants || []),
        this.token.id as IUser,
      ];

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
}
