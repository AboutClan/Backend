import { Gather, IGatherData } from "../db/models/gather";

export default class GatherService {
  constructor() {}

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
      await Gather.create(data);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
