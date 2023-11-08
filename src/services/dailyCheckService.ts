import { JWT } from "next-auth/jwt";
import { DailyCheck } from "../db/models/dailyCheck";
import { Notice } from "../db/models/notice";

export default class DailyCheckService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setDailyCheck() {
    try {
      await DailyCheck.create({
        uid: this.token.uid,
        name: this.token.name,
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getLog() {
    try {
      const result = await DailyCheck.find(
        { uid: this.token.uid },
        "-_id -__v"
      );
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async getAllLog() {
    try {
      const result = await DailyCheck.find({}, "-_id -__v");
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
