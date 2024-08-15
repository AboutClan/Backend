import { Log } from "../db/models/log";
import { IUser, User } from "../db/models/user";
import { now } from "../utils/dateUtils";

export default class AdminLogService {
  constructor() {}

  async deleteLog(day: number) {
    if (day < 7) return;

    const targetDate = now().subtract(day, "days").toDate();
    await Log.deleteMany({ timestamp: { $lt: targetDate } });
    return;
  }
}
