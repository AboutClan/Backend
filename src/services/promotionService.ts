import { JWT } from "next-auth/jwt";
import { Promotion } from "../db/models/promotion";
import dayjs from "dayjs";
import UserService from "./userService";

export default class PromotionService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getPromotion() {
    try {
      const promotionData = await Promotion.find({}, "-_id -__v");
      return promotionData;
    } catch (err: any) {}
  }

  async setPromotion(name: string) {
    const userService: UserService = new UserService(this.token);

    try {
      const previousData = await Promotion.findOne({ name });
      const now = dayjs().format("YYYY-MM-DD");

      if (previousData) {
        const dayDiff = dayjs(now).diff(dayjs(previousData?.lastDate), "day");
        if (dayDiff > 2) {
          await Promotion.updateOne(
            { name },
            { name, uid: this.token.uid, lastDate: now },
          );

          await userService.updatePoint(100, "홍보 이벤트 참여");
        }
      } else {
        await Promotion.create({ name, uid: this.token.uid, lastDate: now });
        await userService.updatePoint(300, "홍보 이벤트 참여");
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
