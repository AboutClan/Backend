import { Request } from "../db/models/request";
import { DatabaseError } from "../errors/DatabaseError";

export default class RequestService {
  constructor() {}

  async getRequest() {
    const gatherData = await Request.find({}, "-_id");
    return gatherData;
  }

  async createRequest(data: any) {
    const created = await Request.create(data);

    if (!created) throw new DatabaseError("create request failed");
    return;
  }
}
