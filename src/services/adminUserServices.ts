import { IUser, User } from "../db/models/user";

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
