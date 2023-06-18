import { JWT } from "next-auth/jwt";
import { IUser, User } from "../db/models/user";

const logger = require("../../logger");

export default class AdminUserService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getAllUser() {
    const users = await User.find({});
    return users;
  }

  async updateProfile(profile: Partial<IUser>) {
    await User.updateOne({ uid: profile.uid }, profile);
    return;
  }

  async updateValue(
    uid: string,
    value: string,
    type: "point" | "score" | "deposit",
    message: string
  ) {
    const user = await User.findOne({ uid: this.token.uid });
    if (!user) throw new Error();

    switch (type) {
      case "point":
        user.point += parseInt(value);
        break;
      case "score":
        user.score += parseInt(value);
        break;
      case "deposit":
        user.deposit += parseInt(value);
        break;
    }

    await user.save();

    logger.logger.info(message, {
      metadata: { type, uid, value },
    });
    return;
  }

  async deleteScore() {
    await User.updateMany({}, { $set: { score: 0 } });
    return;
  }

  async deletePoint() {
    await User.updateMany({}, { $set: { point: 0 } });
    return;
  }

  async getCertainUser(uid: string) {
    const user = await User.findOne({ uid: uid });

    return user;
  }

  async setRole(role: string, uid: string) {
    await User.updateOne(
      { status: "active", uid: uid },
      {
        $set: {
          role: role,
        },
      }
    );

    return;
  }
}
