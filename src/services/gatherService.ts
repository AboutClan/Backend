import { JWT } from "next-auth/jwt";
import { Gather, IGatherData } from "../db/models/gather";

export default class GatherService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getGather() {
    try {
      const gatherData = await Gather.find().select("-_id");
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

  // async participateGather(gatherId: string) {
  //   const gather = await Gather.findOne({ id: gatherId });

  //   await gather?.participants = [
  //     ...(gather?.participants || []),
  //     this.token.id
  //   ];
  // }
}
