import { JWT } from "next-auth/jwt";
import { Collection } from "../db/models/collection";
import { DailyCheck } from "../db/models/dailyCheck";
import { Notice } from "../db/models/notice";

export default class CollectionService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setCollection(alphabet: string) {
    try {
      const previousData = await Collection.findOne({ uid: this.token.uid });
      if (previousData) {
        if (previousData.collects.includes(alphabet)) return;
        else {
          //알파벳 5개를 다 모은 경우
          if (previousData.collects.length === 4) {
            await Collection.updateOne(
              { uid: this.token.uid },
              { $set: { collects: [] }, $inc: { collectCnt: 1 } }
            );
            return "completed";
          }
          await Collection.updateOne(
            { uid: this.token.uid },
            { $push: { collects: alphabet } }
          );
        }
      } else {
        await Collection.create({
          name: this.token.name,
          uid: this.token.uid,
          collects: [alphabet],
          collectCnt: 0,
        });
      }
      return null;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCollection() {
    try {
      const result = await Collection.find(
        { uid: this.token.uid },
        "-_id -__v"
      );
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
