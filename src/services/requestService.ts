import { Request } from "../db/models/request";

export default class RequestService {
  constructor() {}

  async getRequest() {
    try {
      const gatherData = await Request.find({}, "-_id");
      return gatherData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createRequest(data: any) {
    try {
      await Request.create(data);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
