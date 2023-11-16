import { JWT } from "next-auth/jwt";
import { IUser, User, restType } from "../db/models/user";
import dayjs from "dayjs";
import { Vote } from "../db/models/vote";
import { getProfile } from "../utils/oAuthUtils";
import * as CryptoJS from "crypto-js";
import { Promotion } from "../db/models/promotion";
import { Notice } from "../db/models/notice";

const logger = require("../../logger");

export default class UserService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async decodeByAES256(encodedTel: string) {
    const key = process.env.cryptoKey;
    if (!key) return encodedTel;

    const bytes = CryptoJS.AES.decrypt(encodedTel, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }

  createQueryString(strArr: string[]) {
    let result = "";
    strArr.forEach((str) => {
      result += ` ${str}`;
    });

    return result;
  }

  async getUserWithUid(uid: string) {
    try {
      const result = await User.findOne({ uid });

      if (result && result.telephone)
        result.telephone = await this.decodeByAES256(result.telephone);

      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  //유저의 _id도 같이 전송. 유저 로그인 정보 불일치 문제를 클라이언트에서 접속중인 session의 _id와 DB에서 호출해서 가져오는 _id의 일치여부로 판단할 것임
  async getUserInfo(strArr: string[]) {
    let queryString = this.createQueryString(strArr);
    if (strArr.length) queryString = "-_id" + queryString;

    try {
      const result = await User.findOne({ uid: this.token.uid }, queryString);

      if (result && result.telephone)
        result.telephone = await this.decodeByAES256(result.telephone);

      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getAllUserInfo(strArr: string[]) {
    const queryString = this.createQueryString(strArr);
    try {
      const users = await User.find({}, "-_id" + queryString);

      users.forEach(async (user) => {
        if (user.telephone)
          user.telephone = await this.decodeByAES256(user.telephone);
      });

      return users;
    } catch (err: any) {
      throw new Error();
    }
  }

  async updateUser(updateInfo: Partial<IUser>) {
    try {
      await User.updateOne({ uid: this.token.uid }, { $set: updateInfo });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getParticipationRate(startDay: string, endDay: string, all?: any) {
    try {
      const allUser = all
        ? await User.find({ isActive: true })
        : await User.find({ isActive: true, uid: this.token.uid });
      const attendForm = allUser.reduce((accumulator: any[], user) => {
        return [...accumulator, { uid: user.uid, cnt: 0 }];
      }, []);

      const forParticipation = await Vote.collection
        .aggregate([
          {
            $match: {
              date: {
                $gte: dayjs(startDay).toDate(),
                $lt: dayjs(endDay).toDate(),
              },
            },
          },
          {
            $unwind: "$participations",
          },
          {
            $project: {
              status: "$participations.status",
              attendences: "$participations.attendences",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "attendences.user",
              foreignField: "_id",
              as: "attendences.user",
            },
          },
          //open과 free 정보 모두
          {
            $match: {
              $or: [{ status: "open" }, { status: "free" }],
            },
          },
          {
            $unwind: "$attendences.user",
          },
          {
            $replaceRoot: {
              newRoot: "$attendences.user",
            },
          },
          {
            $group: {
              _id: "$uid",
              cnt: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: false,
              uid: "$_id",
              cnt: "$cnt",
            },
          },
        ])
        .toArray();

      const filtered = forParticipation.filter((who) => who.cnt > 0);

      filtered.forEach((obj) => {
        const idx = attendForm.findIndex((user) => user.uid === obj.uid);
        if (attendForm[idx]) attendForm[idx].cnt = obj.cnt;
      });
      return attendForm.filter((who) => who.cnt > 0);
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getVoteRate(startDay: string, endDay: string) {
    try {
      const allUser = await User.find({ isActive: true });
      const attendForm = allUser.reduce((accumulator, user) => {
        return { ...accumulator, [user.uid.toString()]: 0 };
      }, {});

      const forVote = await Vote.collection
        .aggregate([
          {
            $match: {
              date: {
                $gte: dayjs(startDay).toDate(),
                $lt: dayjs(endDay).toDate(),
              },
            },
          },
          { $unwind: "$participations" },
          { $unwind: "$participations.attendences" },
          {
            $project: {
              attendences: "$participations.attendences",
            },
          },
          {
            $project: {
              firstChoice: "$attendences.firstChoice",
              attendences: "$attendences",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "attendences.user",
              foreignField: "_id",
              as: "attendences.user",
            },
          },
        ])
        .toArray();

      const voteCnt = forVote
        .flatMap((participation) => participation.attendences)
        .filter((attendence) => attendence.firstChoice === true)
        .flatMap((attendance) => attendance.user)
        .map((user) => user.uid.toString())
        .reduce((acc, val) => {
          if (val in acc) {
            acc[val]++;
          } else {
            acc[val] = 1;
          }
          return acc;
        }, {});

      const voteRateForm = { ...attendForm, ...voteCnt };
      const result = [];

      for (let value in voteRateForm) {
        result.push({ uid: value, cnt: voteRateForm[value] });
      }

      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async patchProfile() {
    try {
      const profile = await getProfile(
        this.token.accessToken as string,
        this.token.uid as string
      );
      if (!profile) {
        return new Error();
      }
      await User.updateOne({ uid: this.token.uid }, { $set: profile });
      const updatedUser = await User.findOne({ uid: this.token.uid });
      return updatedUser;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updatePoint(point: number, message: string) {
    try {
      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      user.point += point;
      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }

    logger.logger.info(message, {
      metadata: { type: "point", uid: this.token.uid, value: point },
    });
    return;
  }

  async updateScore(score: number, message: string) {
    try {
      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      user.score += score;
      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }

    logger.logger.info(message, {
      metadata: { type: "score", uid: this.token.uid, value: score },
    });
    return;
  }

  async updateDeposit(deposit: number, message: string) {
    try {
      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      user.deposit += deposit;
      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }

    logger.logger.info(message, {
      metadata: { type: "deposit", uid: this.token.uid, value: deposit },
    });
    return;
  }

  async setPreference(place: any, subPlace: any) {
    try {
      await User.updateOne(
        { uid: this.token.uid },
        { studyPreference: { place, subPlace } }
      );
    } catch (err: any) {
      throw new Error(err);
    }

    return;
  }
  async getPreference() {
    try {
      const result = await User.findOne({ uid: this.token.uid })
        .populate("studyPreference.place studyPreference.subPlace")
        .select("studyPreference");
      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async patchRole(role: string) {
    if (
      ![
        "noMember",
        "waiting",
        "human",
        "member",
        "manager",
        "previliged",
        "resting",
      ].includes(role)
    )
      throw new Error();

    try {
      this.updateUser({ role });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async setRest(info: restType) {
    try {
      const { startDate, endDate, type, content } = info;

      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      const startDay = dayjs(startDate, "YYYY-MM-DD");
      const endDay = dayjs(endDate, "YYYY-MM-DD");
      const dayDiff = endDay.diff(startDay, "day");

      user.rest.type = type;
      user.rest.content = content;
      user.rest.startDate = startDate;
      user.rest.endDate = endDate;
      user.rest.restCnt = user.rest.restCnt + 1;
      user.rest.cumulativeSum = user.rest.cumulativeSum + dayDiff;

      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async deleteFriend(toUid: string) {
    try {
      const user = await User.findOne({ uid: this.token.uid });
      if (user && user.friend.includes(toUid)) {
        await User.updateOne(
          { uid: this.token.uid },
          { $pull: { friend: toUid } }
        );
        return;
      } else {
        return "not has friend";
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async setFriend(toUid: string) {
    try {
      const filterMine = { uid: this.token.uid };
      const updateMine = { $addToSet: { friend: toUid } };
      const filterRequester = { uid: toUid };
      const updateRequester = { $addToSet: { friend: this.token.uid } };
      const options = { upsert: true };

      await User.findOneAndUpdate(filterMine, updateMine, options);
      await User.findOneAndUpdate(filterRequester, updateRequester, options);

      return null;
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

  async requestFriend(toUid: string, message: string) {
    try {
      await Notice.create({
        from: this.token.uid,
        to: toUid,
        type: "friend",
        status: "pending",
        message,
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async updateRequestFriend(from: string, status: string) {
    try {
      const result = await Notice.findOne({
        to: this.token.uid,
        from,
        type: "friend",
      });
      if (result) {
        result.status = status;
        await result.save();
      } else return "no data";
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getPromotion() {
    try {
      const promotionData = await Promotion.find({}, "-_id -__v");
      return promotionData;
    } catch (err: any) {}
  }

  async setPromotion(name: string) {
    try {
      const previousData = await Promotion.findOne({ name });
      const now = dayjs().format("YYYY-MM-DD");

      if (previousData) {
        const dayDiff = dayjs(now).diff(dayjs(previousData?.lastDate), "day");
        if (dayDiff > 2) {
          await Promotion.updateOne(
            { name },
            { name, uid: this.token.uid, lastDate: now }
          );

          await this.updatePoint(100, "홍보 이벤트 참여");
        }
      } else {
        await Promotion.create({ name, uid: this.token.uid, lastDate: now });
        await this.updatePoint(300, "홍보 이벤트 참여");
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async test() {
    throw new Error("error");
  }
}
