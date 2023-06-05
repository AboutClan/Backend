import { JWT } from "next-auth/jwt";
import { Log } from "../db/models/log";

export default class LogService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getLog(type: string) {
    // try {
    //   const logs = await MongoDB.find(
    //     {},
    //     { limit: 10, sort: { timestamp: -1 } }
    //   ).exec();
    //   return logs;
    // } catch (error) {
    //   console.error("로그 가져오기 실패:", error);
    //   return null;
    // }

    // const logs = logger.getLogsFromMongoDB();

    // const logs = winston.loggers.get();

    // const logs = Log.find({ meta: type });

    const logs = await Log.collection
      .aggregate([
        {
          $match: {
            meta: {
              type,
              uid: this.token.uid,
            },
          },
        },
      ])
      .toArray();

    return logs;
  }
}
