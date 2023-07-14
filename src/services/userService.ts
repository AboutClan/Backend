import { JWT } from "next-auth/jwt";
import { IUser, User } from "../db/models/user";
import dayjs from "dayjs";
import { Vote } from "../db/models/vote";
import { getProfile } from "../utils/oAuthUtils";
import * as CryptoJS from "crypto-js";

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

  async getUserInfo(strArr: string[]) {
    const queryString = this.createQueryString(strArr);

    try {
      const result = await User.findOne(
        { uid: this.token.uid },
        "-_id" + queryString
      );

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
          {
            $match: {
              status: "open",
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

      forParticipation.forEach((obj) => {
        const idx = attendForm.findIndex((user) => user.uid === obj.uid);
        if (attendForm[idx]) attendForm[idx].cnt = obj.cnt;
      });
      return attendForm;
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

      console.log(forVote);
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

  async test() {
    throw new Error("error");
  }
}
