import * as CryptoJS from "crypto-js";
import dayjs from "dayjs";
import { JWT } from "next-auth/jwt";
import { Counter } from "../db/models/counter";
import { Log } from "../db/models/log";
import { Notice } from "../db/models/notice";
import { Place } from "../db/models/place";
import { Promotion } from "../db/models/promotion";
import { IUser, restType, User } from "../db/models/user";
import { Vote } from "../db/models/vote";
import { getProfile } from "../utils/oAuthUtils";

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
  async getUsersWithUids(uids: string[]) {
    try {
      const results = await User.find({ uid: { $in: uids } });

      for (const result of results) {
        if (result.telephone)
          result.telephone = await this.decodeByAES256(result.telephone);
      }

      return results;
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

      //   .select(
      //   "avatar birth comment isActive location name profileImage score uid"
      // );

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

  async getSimpleUserInfo() {
    try {
      const result = await User.findOne({ uid: this.token.uid }).select(
        "avatar birth comment isActive location name profileImage score uid",
      );

      if (result && result.telephone)
        result.telephone = await this.decodeByAES256(result.telephone);

      return result;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getAllSimpleUserInfo() {
    try {
      const users = await User.find({}).select(
        "avatar birth comment isActive location name profileImage score uid",
      );

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

  async setUserInactive() {
    try {
      const users = await User.find({ location: "수원" });
      const temp1 = [
        "윤경",
        "최소영",
        "최지원",
        "권혜지",
        "서윤호",
        "조현정",
        "윤주열",
        "이민복",
        "재유",
        "이소정",
        "김석훈",
        "선준",
        "시온",
        "조민성",
      ];

      if (!users) throw new Error();

      users?.forEach((item) => {
        if (temp1.includes(item?.name)) {
          item.isActive = true;
          item.belong = "수원/C";
        }
        item.save();
      });
    } catch (err: any) {
      throw new Error();
    }
  }

  async getParticipationRate(
    startDay: string,
    endDay: string,
    all: boolean = false,
    location?: string | null,
    summary?: boolean,
  ) {
    try {
      const allUser = all
        ? await User.find({ isActive: true })
        : await User.find({ isActive: true, uid: this.token.uid });
      let attendForm = allUser.reduce((accumulator: any[], user) => {
        return [
          ...accumulator,
          {
            uid: user.uid,
            cnt: 0,
            userSummary: {
              birth: user.birth,
              avatar: user.avatar,
              comment: user.comment,
              isActive: user.isActive,
              location: user.location,
              name: user.name,
              profileImage: user.profileImage,
              score: user.score,
              uid: user.uid,
            },
          },
        ];
      }, []);

      let forParticipation: any[];
      forParticipation = await Vote.collection
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
              location: "$location",
            },
          },
        ])
        .toArray();

      let filtered = forParticipation.filter((who: any) => who.cnt > 0);

      filtered.forEach((obj) => {
        const idx = attendForm.findIndex((user) => user.uid === obj.uid);
        if (attendForm[idx]) attendForm[idx].cnt = obj.cnt;
      });

      if (location) {
        attendForm = attendForm.filter(
          (data) => data.userSummary.location.toString() == location.toString(),
        );
      }
      if (!summary) {
        attendForm.forEach((data) => {
          delete data.userSummary;
        });
      }

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
        this.token.uid as string,
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

  async updatePoint(point: number, message: string, sub?: string) {
    try {
      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      user.point += point;
      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }

    logger.logger.info(message, {
      metadata: {
        type: "point",
        sub,
        uid: this.token.uid,
        value: point,
      },
    });
    return;
  }

  async initMonthScore() {
    try {
      const users = await User.find();
      if (!users) throw new Error();

      users.forEach((user) => {
        user.monthScore = 0;
        user.save();
      });
    } catch (err: any) {
      throw new Error(err);
    }
    return;
  }
  async updateScore(score: number, message: string, sub?: string) {
    try {
      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      user.score += score;
      user.monthScore += score;
      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }

    logger.logger.info(message, {
      metadata: { type: "score", sub, uid: this.token.uid, value: score },
    });
    return;
  }

  async updateUserAllScore() {
    try {
      const users = await User.find();
      if (!users) throw new Error();

      for (const user of users) {
        if (!user?.score) continue;
        user.score = 0;
        user.point += 20;
        await user.save();
        logger.logger.info("동아리 점수 초기화", {
          metadata: { type: "score", uid: user.uid, value: 0 },
        });
        logger.logger.info("동아리 점수 초기화 보상", {
          metadata: { type: "point", uid: user.uid, value: 20 },
        });
      }
    } catch (err: any) {
      throw new Error(err);
    }

    return;
  }

  async updateDeposit(deposit: number, message: string, sub?: string) {
    try {
      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      user.deposit += deposit;
      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }

    logger.logger.info(message, {
      metadata: { type: "deposit", sub, uid: this.token.uid, value: deposit },
    });
    return;
  }

  async setPreference(place: any, subPlace: any[]) {
    try {
      const user = await User.findOne(
        { uid: this.token.uid },
        "studyPreference",
      );

      //update main preference
      if (user?.studyPreference?.place) {
        const placeId = user?.studyPreference.place;
        await Place.updateOne(
          { _id: placeId, prefCnt: { $gt: 0 } },
          { $inc: { prefCnt: -1 } },
        );
      }

      await User.updateOne(
        { uid: this.token.uid },
        { studyPreference: { place, subPlace } },
      );

      //update sub preference
      if (user?.studyPreference?.subPlace) {
        user?.studyPreference?.subPlace.forEach(async (placeId) => {
          await Place.updateOne(
            { _id: placeId, prefCnt: { $gt: 0 } },
            { $inc: { prefCnt: -1 } },
          );
        });
      }

      subPlace.forEach(async (placeId) => {
        await Place.updateOne({ _id: placeId }, { $inc: { prefCnt: 1 } });
      });
      await Place.updateOne({ _id: place }, { $inc: { prefCnt: 1 } });
    } catch (err: any) {
      throw new Error(err);
    }

    return;
  }

  // studyPreference도 id만 보내는 걸로 변경
  async getPreference() {
    try {
      const result = await User.findOne({ uid: this.token.uid }).select(
        "studyPreference",
      );
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
        "enthusiastic",
      ].includes(role)
    )
      throw new Error();

    try {
      if (role === "enthusiastic") {
        const user = await User.findOne({ uid: this.token.uid });
        if (user) {
          user.role = role;
          await user.save();
        }
        await Counter.updateOne(
          {
            key: "enthusiasticMember",
            location: user?.location,
          },
          { $inc: { seq: 1 } },
        );
      } else await this.updateUser({ role });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async setRest(info: Omit<restType, "restCnt" | "cumulativeSum">) {
    try {
      const { startDate, endDate, type, content } = info;

      const user = await User.findOne({ uid: this.token.uid });
      if (!user) throw new Error();

      const startDay = dayjs(startDate, "YYYY-MM-DD");
      const endDay = dayjs(endDate, "YYYY-MM-DD");
      const dayDiff = endDay.diff(startDay, "day");

      if (!user.rest) {
        user.rest = {
          type,
          content,
          startDate,
          endDate,
          restCnt: 1,
          cumulativeSum: dayDiff,
        };
      } else {
        user.rest.type = type;
        user.rest.content = content;
        user.rest.startDate = startDate;
        user.rest.endDate = endDate;
        user.rest.restCnt = user.rest.restCnt + 1;
        user.rest.cumulativeSum = user.rest.cumulativeSum + dayDiff;
      }
      await user.save();
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async deleteFriend(toUid: string) {
    try {
      const filterMine = { uid: this.token.uid };
      const updateMine = { $pull: { friend: toUid } };
      const filterRequester = { uid: toUid };
      const updateRequester = { $pull: { friend: this.token.uid } };

      await User.findOneAndUpdate(filterMine, updateMine);
      await User.findOneAndUpdate(filterRequester, updateRequester);

      return null;
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

      await Notice.create({
        from: this.token.uid,
        to: toUid,
        message: `${this.token.name}님과 친구가 되었습니다.`,
        type: "friend",
        status: "response",
      });

      return null;
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
            { name, uid: this.token.uid, lastDate: now },
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

  async patchBelong(uid: number, belong: string) {
    try {
      await User.updateOne({ uid }, { belong });
    } catch (err: any) {
      throw new Error(err);
    }
    return;
  }

  async getMonthScoreLog() {
    // 현재 날짜를 구합니다.
    const currentDate = new Date();

    // 이번 달의 시작일과 마지막 날을 계산합니다.
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    try {
      const logs = await Log.find(
        {
          "meta.type": "score",
          "meta.uid": this.token.uid,
          timestamp: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
        "-_id timestamp message meta",
      )
        .sort({ timestamp: -1 })
        .limit(30);
      return logs;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getLog(type: string) {
    try {
      const logs = await Log.find(
        {
          "meta.uid": this.token.uid,
          "meta.type": type,
        },
        "-_id timestamp message meta",
      )
        .sort({ timestamp: -1 })
        .limit(30);
      return logs;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getAllLog(type: string) {
    try {
      const logs = await Log.find(
        { "meta.type": type },
        "-_id timestamp message meta",
      );

      return logs;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async test() {
    // await Place.updateMany({}, { prefCnt: 0 });

    // const users = await User.find();

    // users.forEach(async (user) => {
    //   if (user?.studyPreference?.place) {
    //     await Place.updateOne(
    //       { _id: user.studyPreference.place },
    //       { $inc: { prefCnt: 1 } },
    //     );
    //   }

    //   if (user?.studyPreference?.subPlace) {
    //     user?.studyPreference?.subPlace.forEach(async (placeId) => {
    //       await Place.updateOne({ _id: placeId }, { $inc: { prefCnt: 1 } });
    //     });
    //   }
    // });
    // return null;

    const users = await User.find({});

    users.forEach((user) => {
      const score = user.score;
      const divScore = Math.round(score / 4);
      user.score = divScore;
      user.save();
    });

    return;
  }
}
