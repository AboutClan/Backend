import { JWT } from "next-auth/jwt";
import { Notice, NoticeZodSchema } from "../db/models/notice";
import { User } from "../db/models/user";
import { DatabaseError } from "../errors/DatabaseError";
const logger = require("../../logger");
export default class NoticeService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }
  async getActiveLog() {
    const result = await Notice.find(
      {
        to: this.token.uid,
        $or: [{ type: "like" }, { type: "friend" }, { type: "alphabet" }],
      },
      "-_id -__v",
    );
    return result;
  }

  async deleteLike(to: string) {
    const updated = await User.findOneAndUpdate(
      { uid: to },
      { $inc: { like: -1 } },
    );
    if (!updated) throw new DatabaseError("delete like failed");
  }

  async setLike(to: string, message: string) {
    try {
      const validatedNotice = NoticeZodSchema.parse({
        from: this.token.uid,
        to,
        message,
      });

      await Notice.create(validatedNotice);
    
      await User.findOneAndUpdate({ uid: to }, { $inc: { like: 1, point: 2 } });
     
      logger.logger.info(message, {
        metadata: {
          type: "point",
          uid: to,
          value: 2,
        },
      });
    
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getLike() {
    const result = await Notice.find(
      { to: this.token.uid, type: "like" },
      "-_id -__v",
    );
    return result;
  }
  async getLikeAll() {
    const results = await Notice.find({ type: "like" }, "-_id -__v");
    return results;
  }

  async getFriendRequest() {
    const result = await Notice.find(
      { to: this.token.uid, type: "friend" },
      "-_id -__v",
    );
    return result;
  }

  async requestNotice(
    type: "friend" | "alphabet",
    toUid: string,
    message: string,
    sub?: string,
  ) {
    try {
      await Notice.create({
        from: this.token.uid,
        to: toUid,
        type,
        status: "pending",
        message,
        sub,
      });
    } catch (err: any) {
      throw new DatabaseError("create notice failed");
    }
  }
  async updateRequestFriend(
    type: "friend" | "alphabet",
    from: string,
    status: string,
  ) {
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
  }
}
