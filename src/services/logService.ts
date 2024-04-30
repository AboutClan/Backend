import { JWT } from "next-auth/jwt";
import { Log } from "../db/models/log";

export default class LogService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getLog(type: string) {
    try {
      const logs = await Log.find(
        {
          "meta.uid": this.token.uid,
          "meta.type": type,
        },
        "-_id timestamp message meta",
      )
        .sort({ timestamp: -1 })
        .limit(30);
      return logs;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getAllLog(type: string) {
    try {
      const logs = await Log.find(
        { "meta.type": type },
        "-_id timestamp message meta",
      );

      return logs;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
