import { JWT } from "next-auth/jwt";
import { Collection } from "../db/models/collection";
import { DailyCheck } from "../db/models/dailyCheck";
import { Notice } from "../db/models/notice";

const ALPHABET_COLLECTION = ["A", "B", "O", "U", "T"];
export default class CollectionService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setCollection(alphabet: string) {
    try {
      const previousData = await Collection.findOne({ user: this.token.id });
      if (previousData) {
        await Collection.updateOne(
          { user: this.token.id },
          { $push: { collects: alphabet } }
        );
      } else {
        await Collection.create({
          user: this.token.id,
          collects: [alphabet],
          collectCnt: 0,
        });
      }
      return null;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async setCollectionCompleted() {
    try {
      const previousData = await Collection.findOne({ user: this.token.id });
      let myAlphabets = previousData?.collects;
      if (ALPHABET_COLLECTION.every((item) => myAlphabets?.includes(item))) {
        ALPHABET_COLLECTION.forEach((item) => {
          const idx = myAlphabets?.indexOf(item);
          if (idx !== -1) myAlphabets?.splice(idx as number, 1);
        });
        await Collection.updateOne(
          { user: this.token.id },
          { collects: myAlphabets }
        );
      } else {
        return "not completed";
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCollection() {
    try {
      const result = await Collection.findOne({ user: this.token.id })
        .populate("user")
        .select("-_id");
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCollectionAll() {
    try {
      const result = await Collection.find({}, "-_id -__v").populate("user");
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
