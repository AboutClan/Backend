import { JWT } from "next-auth/jwt";
import { IUser, User } from "../db/models/user";
import dayjs from "dayjs";
import { Vote } from "../db/models/vote";
import { getProfile } from "../utils/oAuthUtils";
import * as CryptoJS from "crypto-js";

export default class UserService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async decodeByAES256(encodedTel: string) {
    console.log(1);
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
    const result = await User.findOne(
      { uid: this.token.uid },
      "-_id" + queryString
    );

    if (!result) return;

    if (result.telephone)
      result.telephone = await this.decodeByAES256(result.telephone);

    return result;
  }

  async getAllUserInfo(strArr: string[]) {
    const queryString = this.createQueryString(strArr);
    const users = await User.find({}, "-_id" + queryString);

    users.forEach(async (user) => {
      if (user.telephone)
        user.telephone = await this.decodeByAES256(user.telephone);
    });

    return users;
  }

  async updateUser(updateInfo: Partial<IUser>) {
    await User.updateOne({ uid: this.token.uid }, { $set: updateInfo });
  }

  async getParticipationRate(startDay: string, endDay: string) {
    const allUser = await User.find({ isActive: true });
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
  }

  async getVoteRate(startDay: string, endDay: string) {
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
  }

  async patchProfile() {
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
  }

  async updatePoint(point: number) {
    const user = await User.findOne({ uid: this.token.uid });
    if (!user) throw new Error();

    user.point += point;
    await user.save();
  }

  async updateScore(score: number) {
    const user = await User.findOne({ uid: this.token.uid });
    if (!user) throw new Error();

    user.score += score;
    await user.save();
  }
}
