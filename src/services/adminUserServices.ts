import { JWT } from "next-auth/jwt";
import { IUser, User } from "../db/models/user";

const logger = require("../../logger");

export default class AdminUserService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getAllUser() {
    try {
      const users = await User.find({ isActive: true });
      return users;
    } catch (err) {
      throw new Error();
    }
  }

  async updateProfile(profile: Partial<IUser>) {
    try {
      await User.updateOne({ uid: profile.uid }, profile);
      return;
    } catch (err) {
      throw new Error();
    }
  }

  async updateValue(
    uid: string,
    value: string,
    type: "point" | "score" | "deposit",
    message: string
  ) {
    const user = await User.findOne({ uid });
    if (!user) throw new Error();

    try {
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
    } catch (err) {
      throw new Error();
    }

    logger.logger.info(message, {
      metadata: { type, uid, value },
    });
    return;
  }

  async deleteScore() {
    try {
      await User.updateMany({}, { $set: { score: 0 } });
      return;
    } catch (err) {
      throw new Error();
    }
  }

  async deletePoint() {
    try {
      await User.updateMany({}, { $set: { point: 0 } });
      return;
    } catch (err) {
      throw new Error();
    }
  }

  async getCertainUser(uid: string) {
    try {
      const user = await User.findOne({ uid: uid });
      return user;
    } catch (err) {
      throw new Error();
    }
    return;
  }

  async setRole(role: string, uid: string) {
    try {
      await User.updateOne(
        { status: "active", uid: uid },
        {
          $set: {
            role: role,
          },
        }
      );
    } catch (err) {
      throw new Error();
    }
    return;
  }
}
