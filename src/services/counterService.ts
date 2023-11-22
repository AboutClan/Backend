import { JWT } from "next-auth/jwt";
import { Counter } from "../db/models/counter";
import { Notice } from "../db/models/notice";

export default class CounterService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setCounter(key: string, location: string) {
    return "바로 종료";
    try {
      const findData = await Counter.findOne({ key, location });
      if (findData) {
        await Counter.updateOne({ key, location }, { $inc: { seq: 1 } });
        return "find";
      } else {
        await Counter.create({
          key,
          seq: 1,
          location,
        });
        return "noFind";
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCounter(key: string, location: string) {
    try {
      const result = await Counter.findOne({ key, location });
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
