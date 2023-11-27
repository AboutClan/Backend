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
  async changeCollection(mine: string, opponent: string, toUid: any) {
    try {
      const myAlphabets = await Collection.findOne({ user: this.token.id });
      const opponentAlphabets = await Collection.findOne({ user: toUid });

      if (!myAlphabets?.collects?.includes(mine)) {
        return "해당 알파벳을 보유하고 있지 않습니다.";
      }
      if (!opponentAlphabets?.collects?.includes(opponent)) {
        return "상대가 해당 알파벳을 보유중이지 않습니다.";
      }
      const myCollects = myAlphabets.collects;
      const opponentCollects = opponentAlphabets.collects;

      const myIdx = myCollects.indexOf(mine);
      const opponentIdx = opponentCollects.indexOf(opponent);
      myCollects.splice(myIdx, 1);
      opponentCollects.splice(opponentIdx, 1);

      myCollects.push(opponent);
      opponentCollects.push(mine);

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
