import { Gather, IGatherData } from "../db/models/gather";

export default class GatherService {
  constructor() {}

  async getGather() {
    const gatherData = await Gather.find();
    return gatherData;
  }

  async createGather(data: IGatherData) {
    await Gather.create(data);
    return;
  }
}
