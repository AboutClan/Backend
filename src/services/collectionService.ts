import { JWT } from "next-auth/jwt";
import { Collection, CollectionZodSchema } from "../db/models/collection";
import { Request } from "../db/models/request";
import { User } from "../db/models/user";
const ALPHABET_COLLECTION = ["A", "B", "O", "U", "T"];
export default class CollectionService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async setCollectionStamp() {
    const validatedCollection = CollectionZodSchema.parse({
      user: this.token.id,
      collectCnt: 0,
      stamps: 0,
    });

    const currentCollection = await Collection.findOne({
      user: this.token.id,
    });
    const currentStamps = currentCollection?.stamps ?? 0;

    let updatedStamps = currentStamps;
    let updatedAlphabet = null;

    if (currentStamps < 5) {
      await Collection.findOneAndUpdate(
        { user: this.token.id },
        {
          $inc: { stamps: 1 }, // stamps 값을 1 증가
          $setOnInsert: {
            user: validatedCollection.user,
            collectCnt: validatedCollection.collectCnt,
            stamps: validatedCollection.stamps,
          },
        },
        { upsert: true, new: true },
      );
      updatedStamps++;
    }

    const getRandomAlphabet = (percent: number) => {
      const randomValue = Math.random();

      if (randomValue <= percent / 100) {
        const randomIdx = Math.floor(Math.random() * 5);
        const alphabet = ALPHABET_COLLECTION[randomIdx];
        return alphabet;
      }
      return null;
    };
    // stamps가 5인 경우에만 alphabet을 추가합니다
    if (currentCollection?.stamps === 4) {
      const alphabet = getRandomAlphabet(20);
      // stamps가 4인 경우 1 증가 후 5가 되므로 alphabet을 추가
      await Collection.findOneAndUpdate(
        { user: this.token.id },
        {
          $push: { collects: alphabet }, // alphabet을 collects 배열에 추가
          $inc: { collectCnt: 1 }, // collectCnt 값을 1 증가
        },
        { new: true },
      );
      updatedAlphabet = alphabet;
      updatedStamps = 0;
    }

    return {
      alphabet: updatedAlphabet, // alphabet을 얻었으면 반환하고, 그렇지 않으면 null
      stamps: updatedStamps, // 현재 stamps에서 1 증가한 값 반환
    };
  }

  async setCollection(alphabet: string) {
    const validatedCollection = CollectionZodSchema.parse({
      user: this.token.id,
      collects: [alphabet],
      collectCnt: 0,
    });

    await Collection.findOneAndUpdate(
      { user: this.token.id },
      {
        $push: { collects: alphabet },
        $setOnInsert: {
          user: validatedCollection.user,
          collectCnt: validatedCollection.collectCnt,
        },
      },
      { upsert: true, new: true },
    );
    return null;
  }

  async changeCollection(
    mine: string,
    opponent: string,
    myId: string,
    toUid: string,
  ) {
    const findToUser = await User.findOne({ uid: toUid });
    const myAlphabets = await Collection.findOne({ user: myId });
    const opponentAlphabets = await Collection.findOne({
      user: findToUser?._id,
    });

    if (!myAlphabets?.collects?.includes(mine)) {
      return "해당 알파벳을 보유하고 있지 않습니다.";
    }
    if (!opponentAlphabets?.collects?.includes(opponent)) {
      return "상대가 해당 알파벳을 보유중이지 않습니다.";
    }
    const myCollects = myAlphabets?.collects;
    const opponentCollects = opponentAlphabets?.collects;

    const myIdx = myCollects?.indexOf(mine);
    const opponentIdx = opponentCollects?.indexOf(opponent);
    myCollects?.splice(myIdx, 1);
    opponentCollects?.splice(opponentIdx, 1);
    myCollects?.push(opponent);
    opponentCollects?.push(mine);
    await myAlphabets?.save();
    await opponentAlphabets?.save();

    return null;
  }

  async setCollectionCompleted() {
    const previousData = await Collection.findOne({ user: this.token.id });
    const myAlphabets = previousData?.collects?.length
      ? [...previousData?.collects]
      : null;
    if (ALPHABET_COLLECTION.every((item) => myAlphabets?.includes(item))) {
      ALPHABET_COLLECTION.forEach((item) => {
        const idx = myAlphabets?.indexOf(item);
        if (idx !== -1) myAlphabets?.splice(idx as number, 1);
      });
      await Collection.updateOne(
        { user: this.token.id },
        { $set: { collects: myAlphabets }, $inc: { collectCnt: 1 } },
      );
      await Request.create({
        category: "건의",
        title: "알파벳 완성",
        writer: this.token.name,
        content: `${this.token.name}/${
          previousData?.collectCnt ? previousData.collectCnt + 1 : 0
        }`,
      });
    } else {
      return "not completed";
    }
  }

  async getCollection() {
    const result = await Collection.findOne({ user: this.token.id })
      .populate("user")
      .select("-_id");
    return result;
  }

  async getCollectionAll() {
    const result = await Collection.find({}, "-_id -__v").populate("user");
    return result;
  }
}
