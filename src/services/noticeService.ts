import { JWT } from "next-auth/jwt";
import { Notice } from "../db/models/notice";

export default class NoticeService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setLike(to: string, message: string) {
    try {
      await Notice.create({
        from: this.token.uid,
        to,
        message,
        type: "like",
      });
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
}
