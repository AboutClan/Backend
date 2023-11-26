import { JWT } from "next-auth/jwt";
import { Notice } from "../db/models/notice";
import { User } from "../db/models/user";

export default class NoticeService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }
  async getActiveLog() {
    try {
      const result = await Notice.find(
        { to: this.token.uid, $or: [{ type: "like" }, { type: "friend" }] },
        "-_id -__v"
      );
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async setLike(to: string, message: string) {
    try {
      await Notice.create({
        from: this.token.uid,
        to,
        message,
        type: "like",
      });
      await User.findOneAndUpdate({ uid: to }, { $inc: { like: 1 } });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getLike() {
    try {
      const result = await Notice.find(
        { to: this.token.uid, type: "like" },
        "-_id -__v"
      );
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async getLikeAll() {
    try {
      const results = await Notice.find({ type: "like" }, "-_id -__v");
      return results;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getFriendRequest() {
    try {
      const result = await Notice.find(
        { to: this.token.uid, type: "friend" },
        "-_id -__v"
      );
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async requestNotice(
    type: "friend" | "alphabet",
    toUid: string,
    message: string
  ) {
    try {
      await Notice.create({
        from: this.token.uid,
        to: toUid,
        type,
        status: "pending",
        message,
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async updateRequestFriend(
    type: "friend" | "alphabet",
    from: string,
    status: string
  ) {
    try {
      const results = await Notice.find({
        to: this.token.uid,
        from,
        type,
      });
      if (!results) return "no data";
      const result = results[results.length - 1];
      if (result) {
        result.status = status;
        await result.save();
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
