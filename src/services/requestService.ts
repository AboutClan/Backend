import { Request } from "../db/models/request";

export default class RequestService {
  constructor() {}

  async getRequest() {
    const gatherData = await Request.find();
    return gatherData;
  }

  async createRequest(data: any) {
    await Request.create(data);
    return;
  }
}
