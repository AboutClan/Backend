import { JWT } from "next-auth/jwt";
import { DailyCheck } from "../db/models/dailyCheck";
import { Notice } from "../db/models/notice";

export default class DailyCheckService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setDailyCheck(uid: string, name: string) {
    try {
      await DailyCheck.create({
        uid,
        name,
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getAllLog() {
    try {
      const result = await DailyCheck.find({});
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
