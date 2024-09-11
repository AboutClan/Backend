import { JWT } from "next-auth/jwt";
import { Log } from "../db/models/log";
import { User } from "../db/models/user";
import { DatabaseError } from "../errors/DatabaseError";
import e from "express";

export default class StaticService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async roleCheck() {
    const authorized = ["previliged", "manager"];
    const user = await User.findOne({ uid: this.token.uid }).select("role");
    if (!user || !user.role) return false;

    if (authorized.includes(user.role)) return true;
    else return false;
  }

  // 공통적으로 사용되는 aggregation 함수
  async aggregateLogs(message: string, groupField: string, period: Date) {
    return await Log.collection
      .aggregate([
        {
          $match: {
            message: message, // message 필터링
            timestamp: {
              $gte: period, // 한 달 이내의 timestamp 필터링
            },
          },
        },
        {
          $group: {
            _id: `$meta.${groupField}`, // meta.uid별로 그룹화
            count: { $sum: 1 }, // 각 그룹의 개수를 세어 count에 저장
          },
        },
        {
          $sort: { count: -1 }, // count 기준으로 내림차순 정렬
        },
      ])
      .toArray();
  }

  async getUserInSameLocation(month: number = 1) {
    const manager = await User.findById(this.token.id);
    if (!manager) throw new DatabaseError("no user");
    const managerLocation = manager.location;

    const usersInSameLocation = await User.find({
      location: managerLocation,
    }).select("uid name");

    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - month);

    const selfStudy = await this.aggregateLogs(
      "개인 스터디 인증",
      "uid",
      oneMonthAgo,
    );
    const attend = await this.aggregateLogs("스터디 출석", "uid", oneMonthAgo);
    const gather = await this.aggregateLogs(
      "번개 모임 참여",
      "uid",
      oneMonthAgo,
    );
    const group = await this.aggregateLogs("소모임 가입", "uid", oneMonthAgo);

    const mapUserData = (
      userArray: any[],
      logArray: any[],
      logField: string,
    ) => {
      return userArray.map((user) => {
        const matched = logArray.find((log) => user.uid == log._id);
        const userObj =
          typeof user.toJSON === "function" ? user.toJSON() : user;
        if (matched) return { ...userObj, [logField]: matched.count };
        return { ...userObj, [logField]: 0 };
      });
    };

    let updatedArr = mapUserData(
      usersInSameLocation,
      selfStudy,
      "selfStudyCnt",
    );
    updatedArr = mapUserData(updatedArr, attend, "attendCnt");
    updatedArr = mapUserData(updatedArr, gather, "gatherCnt");
    updatedArr = mapUserData(updatedArr, group, "groupCnt");

    const cleanedArr = updatedArr.map((obj) => {
      const { uid, ...rest } = obj;
      return rest;
    });

    console.log(cleanedArr);
    return cleanedArr;
  }

  async monthlyStatics() {}
}
