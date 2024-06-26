import { JWT } from "next-auth/jwt";
import { GiftModel } from "../db/models/gift";

export default class GiftService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getAllGift() {
    try {
      const giftUsers = await GiftModel.find({})
        .sort("createdAt")
        .select("-_id -createdAt -updatedAt -__v");

      return giftUsers;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getGift(id: number) {
    try {
      const giftUser = await GiftModel.find({ giftId: id }).select(
        "-_id -createdAt -updatedAt -__v",
      );

      return giftUser;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async setGift(name: any, cnt: any, giftId: any) {
    const { uid } = this.token;
    try {
      const existingUser = await GiftModel.findOne({
        uid,
        giftId,
      });
      if (existingUser) {
        const user = await GiftModel.findOneAndUpdate(
          { uid: this.token.uid },
          { name, uid, cnt: existingUser.cnt + cnt, giftId },
          { new: true, runValidators: true },
        );
        if (!user) {
          throw new Error("no user");
        }

        const resUser = {
          name: user.name,
          uid: user.uid,
          cnt: user.cnt,
          giftId: user.giftId,
        };

        return resUser;
      }

      const newUser = await GiftModel.create({ name, uid, cnt, giftId });
      const user = {
        name: newUser.name,
        uid: newUser.uid,
        cnt: newUser.cnt,
        giftId: newUser.giftId,
      };

      return user;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
