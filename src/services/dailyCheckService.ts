import dayjs from "dayjs";
import { JWT } from "next-auth/jwt";
import { DailyCheck, DailyCheckZodSchema } from "../db/models/dailyCheck";

export default class DailyCheckService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setDailyCheck() {
    const findDailyCheck = await DailyCheck.findOne({
      uid: this.token.uid,
    }).sort({ updatedAt: -1 });

    if (findDailyCheck?.updatedAt) {
      if (dayjs().isSame(dayjs(findDailyCheck?.updatedAt), "date")) {
        return "이미 출석체크를 완료했습니다.";
      }
    }

    const validatedDailyCheck = DailyCheckZodSchema.parse({
      uid: this.token.uid,
      name: this.token.name,
    });

    await DailyCheck.create(validatedDailyCheck);

    return;
  }

  async getLog() {
    const result = await DailyCheck.find({ uid: this.token.uid }, "-_id -__v");
    return result;
  }
  async getAllLog() {
    const result = await DailyCheck.find({}, "-_id -__v");
    return result;
  }
}
