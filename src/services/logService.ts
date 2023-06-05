import { Log } from "../db/models/log";

const logger = require("../../logger");
const winston = require("winston");

export default class LogService {
  constructor() {}

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

    const logs = Log.find({ meta: type });
    return logs;
  }
}
