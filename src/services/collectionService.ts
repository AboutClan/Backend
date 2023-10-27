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
        });
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getAllLog() {
    try {
      const result = await DailyCheck.find({}, "-_id -__v");
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
