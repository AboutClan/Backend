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
      const previousData = await Collection.findOne({ uid: this.token.uid });
      if (previousData) {
        await Collection.updateOne(
          { uid: this.token.uid },
          { $push: { collects: alphabet } }
        );
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

  async setCollectionCompleted() {
    try {
      const previousData = await Collection.findOne({ uid: this.token.uid });
      let myAlphabets = previousData?.collects;
      if (ALPHABET_COLLECTION.every((item) => myAlphabets?.includes(item))) {
        ALPHABET_COLLECTION.forEach((item) => {
          const idx = myAlphabets?.indexOf(item);
          if (idx !== -1) myAlphabets?.splice(idx as number, 1);
        });
        await Collection.updateOne(
          { uid: this.token.uid },
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
      const result = await Collection.findOne(
        { uid: this.token.uid },
        "-_id -__v"
      );
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getCollectionAll() {
    try {
      const result = await Collection.find({}, "-_id -__v");
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
