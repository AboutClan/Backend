import { IUser, User } from "../db/models/user";

const logger = require("../../logger");

export default class AdminUserService {
  constructor() {}

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
    switch (type) {
      case "point":
        await User.updateOne({ uid }, { point: value });
        break;
      case "score":
        await User.updateOne({ uid }, { score: value });
        break;
      case "deposit":
        await User.updateOne({ uid }, { deposit: value });
        break;
    }

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
