import { JWT } from "next-auth/jwt";
import { Counter } from "../db/models/counter";
import { Notice } from "../db/models/notice";
import { DatabaseError } from "../errors/DatabaseError";

export default class CounterService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setCounter(key: string, location: string) {
    const findData = await Counter.findOne({ key, location });
    if (findData) {
      await Counter.updateOne({ key, location }, { $inc: { seq: 1 } });
    } else {
      await Counter.create({
        key,
        seq: 1,
        location,
      });
    }
    return;
  }

  async getCounter(key: string, location: string) {
    const result = await Counter.findOne({ key, location });
    if (!result) throw new DatabaseError("can't find counter");
    return result.seq;
  }
}
